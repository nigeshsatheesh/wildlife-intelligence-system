"""
train_audio.py
--------------
Trains a species audio classifier on top of TRIPLE CONCATENATED embeddings:
YAMNet (1024-d) + Perch 2.0 (1536-d) + AST (768-d) = 3328-dim combined feature vector per 5-second chunk.

Key Methodology & Enhancements:
1. Disk caching (model/audio_records_cache_3328.pkl) for fast subsequent training & evaluation.
2. 5-Fold Stratified Group Cross-Validation (grouped by ORIGINAL CLIP before augmentation) to prevent leakage.
3. LightGBM / HistGradientBoosting Classifier with balanced class weights.
4. Probability Calibration via CalibratedClassifierCV (Platt scaling / sigmoid).
5. Comprehensive 5-Fold Cross-Validation reporting (Mean ± Std for chunk-level and clip-level accuracy).
6. Pre vs Post calibration average confidence reporting per species.
"""

import os
import sys
import json
import warnings
from typing import List, Tuple, Dict

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore')

import numpy as np
import joblib
import librosa
import librosa.effects

from lightgbm import LGBMClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import StratifiedGroupKFold

from audio_features import (
    YAMNET_SR, PERCH_SR, CHUNK_SAMPLES_32K, MIN_CLIP_SECONDS,
    get_yamnet_model, get_perch_model, get_ast_model, load_and_trim,
    chunk_waveform_32k, extract_combined_embeddings_batch
)

DATA_DIR = '../data/audio-train-clean'
CACHE_PATH = 'model/audio_records_cache_3328.pkl'


def augment_variants(waveform: np.ndarray, sr: int = PERCH_SR) -> List[np.ndarray]:
    """Returns [original, pitch_shift, time_stretch, noise] versions of a waveform for training."""
    variants = [waveform]
    try:
        variants.append(librosa.effects.pitch_shift(waveform, sr=sr, n_steps=2))
    except Exception:
        pass
    try:
        variants.append(librosa.effects.time_stretch(waveform, rate=0.9))
    except Exception:
        pass
    try:
        noise = np.random.normal(0, 0.005, waveform.shape).astype(np.float32)
        variants.append(waveform + noise)
    except Exception:
        pass
    return variants


def main():
    clip_records = []

    if os.path.exists(CACHE_PATH):
        print(f"Loading cached 3328-dim triple embeddings from '{CACHE_PATH}'...", flush=True)
        clip_records = joblib.load(CACHE_PATH)
        print(f"Loaded {len(clip_records)} cached chunk records.", flush=True)
    else:
        print("Initializing models (YAMNet + Perch 2.0 + AST)...", flush=True)
        get_yamnet_model()
        get_perch_model()
        get_ast_model()

        if not os.path.exists(DATA_DIR):
            data_dir = '../data/audio-train'
        else:
            data_dir = DATA_DIR

        species_folders = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])
        print(f"Found species folders in '{data_dir}': {species_folders}", flush=True)

        all_clips: List[Tuple[str, str, int]] = []
        clip_id_counter = 0

        for species in species_folders:
            species_path = os.path.join(data_dir, species)
            files = sorted([f for f in os.listdir(species_path) if f.lower().endswith(('.wav', '.mp3', '.ogg', '.flac', '.m4a'))])
            print(f"{species}: {len(files)} clips found", flush=True)
            for fname in files:
                all_clips.append((species, os.path.join(species_path, fname), clip_id_counter))
                clip_id_counter += 1

        print(f"\nTotal dataset: {len(all_clips)} original clips across {len(species_folders)} species.", flush=True)
        print("\nExtracting 3328-dim triple embeddings (YAMNet 1024 + Perch 1536 + AST 768)...", flush=True)

        all_chunk_metadata = []
        for i, (species, fpath, clip_id) in enumerate(all_clips):
            if (i + 1) % 50 == 0 or (i + 1) == len(all_clips):
                print(f"  Loading waveforms [{i+1}/{len(all_clips)}]...", flush=True)
            waveform = load_and_trim(fpath, sr=PERCH_SR)
            if waveform is None:
                continue

            orig_chunks = chunk_waveform_32k(waveform)
            for chunk in orig_chunks:
                all_chunk_metadata.append((clip_id, species, False, chunk, fpath))

            for variant in augment_variants(waveform, PERCH_SR)[1:]:  # skip original
                aug_chunks = chunk_waveform_32k(variant)
                for chunk in aug_chunks:
                    all_chunk_metadata.append((clip_id, species, True, chunk, fpath))

        print(f"\nTotal chunk samples to process: {len(all_chunk_metadata)}. Running batched feature extraction (batch_size=32)...", flush=True)
        BATCH_SIZE = 32
        for b_start in range(0, len(all_chunk_metadata), BATCH_SIZE):
            b_end = min(b_start + BATCH_SIZE, len(all_chunk_metadata))
            batch_items = all_chunk_metadata[b_start:b_end]
            batch_chunks = [item[3] for item in batch_items]
            embs = extract_combined_embeddings_batch(batch_chunks)
            for item, emb in zip(batch_items, embs):
                clip_records.append({
                    'clip_id': item[0],
                    'species': item[1],
                    'is_aug': item[2],
                    'embedding': emb,
                    'fpath': item[4]
                })
            if (b_end) % 64 == 0 or b_end == len(all_chunk_metadata):
                print(f"  Processed {b_end}/{len(all_chunk_metadata)} chunks...", flush=True)

        os.makedirs('model', exist_ok=True)
        joblib.dump(clip_records, CACHE_PATH)
        print(f"\nSaved extracted feature records to '{CACHE_PATH}'.", flush=True)

    print(f"\nTotal extracted chunk samples: {len(clip_records)} (Feature Dim: {clip_records[0]['embedding'].shape[0]})", flush=True)

    # --- Step 2: 5-Fold Stratified Group Cross-Validation & AST Ablation ---
    print("\n========================================================", flush=True)
    print("      5-FOLD STRATIFIED GROUP CROSS-VALIDATION           ", flush=True)
    print("========================================================", flush=True)

    unique_clips = list({r['clip_id']: (r['species'], r['clip_id']) for r in clip_records}.values())
    clip_species = np.array([c[0] for c in unique_clips])
    clip_ids = np.array([c[1] for c in unique_clips])

    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)

    # Metrics for 3328-dim model
    fold_chunk_accs = []
    fold_clip_accs = []

    # Metrics for Ablated 2560-dim model (YAMNet + Perch only)
    fold_clip_accs_ablated = []

    oof_clip_id = []
    oof_clip_true = []
    oof_clip_pred_uncalib = []
    oof_clip_conf_uncalib = []
    oof_clip_actual_prob_uncalib = []
    oof_clip_pred_calib = []
    oof_clip_conf_calib = []
    oof_clip_actual_prob_calib = []
    oof_clip_pred_ablated = []

    for fold, (train_clip_idx, val_clip_idx) in enumerate(sgkf.split(clip_ids, clip_species, groups=clip_ids)):
        val_clip_set = set(clip_ids[val_clip_idx])
        train_clip_set = set(clip_ids[train_clip_idx])

        train_clips = np.array(sorted(train_clip_set))
        train_clip_species = np.array([
            next(c[0] for c in unique_clips if c[1] == clip_id)
            for clip_id in train_clips
        ])
        inner_sgkf = StratifiedGroupKFold(n_splits=4, shuffle=True, random_state=100 + fold)
        fit_clip_idx, calib_clip_idx = next(inner_sgkf.split(
            train_clips, train_clip_species, groups=train_clips
        ))
        fit_clip_set = set(train_clips[fit_clip_idx])
        calib_clip_set = set(train_clips[calib_clip_idx])

        train_records = [r for r in clip_records if r['clip_id'] in fit_clip_set]
        calib_records = [
            r for r in clip_records
            if r['clip_id'] in calib_clip_set and not r['is_aug']
        ]
        val_records = [r for r in clip_records if r['clip_id'] in val_clip_set and not r['is_aug']]

        X_tr_3328 = np.array([r['embedding'] for r in train_records])
        y_tr = np.array([r['species'] for r in train_records])

        X_cal_3328 = np.array([r['embedding'] for r in calib_records])
        y_cal = np.array([r['species'] for r in calib_records])

        X_va_3328 = np.array([r['embedding'] for r in val_records])
        y_va = np.array([r['species'] for r in val_records])
        val_c_ids = np.array([r['clip_id'] for r in val_records])

        # 1. Full 3328-dim model (YAMNet + Perch + AST)
        base_clf = LGBMClassifier(
            n_estimators=300,
            num_leaves=31,
            reg_alpha=0.1,
            reg_lambda=0.1,
            learning_rate=0.05,
            class_weight='balanced',
            random_state=42 + fold,
            verbose=-1
        )
        base_clf.fit(X_tr_3328, y_tr)

        calib_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv='prefit')
        calib_clf.fit(X_cal_3328, y_cal)

        chunk_acc = accuracy_score(y_va, base_clf.predict(X_va_3328))
        fold_chunk_accs.append(chunk_acc)

        uncalib_probs = base_clf.predict_proba(X_va_3328)
        calib_probs = calib_clf.predict_proba(X_va_3328)
        classes = base_clf.classes_

        # 2. Ablated 2560-dim model (YAMNet + Perch only)
        X_tr_2560 = X_tr_3328[:, :2560]
        X_va_2560 = X_va_3328[:, :2560]
        ablated_clf = LGBMClassifier(
            n_estimators=300,
            num_leaves=31,
            reg_alpha=0.1,
            reg_lambda=0.1,
            learning_rate=0.05,
            class_weight='balanced',
            random_state=42 + fold,
            verbose=-1
        )
        ablated_clf.fit(X_tr_2560, y_tr)
        ablated_probs = ablated_clf.predict_proba(X_va_2560)

        fold_clip_true, fold_clip_pred = [], []
        fold_clip_pred_abl = []

        for cid in sorted(set(val_c_ids)):
            mask = val_c_ids == cid
            true_sp = y_va[mask][0]

            avg_p_uncalib = uncalib_probs[mask].mean(axis=0)
            pred_uncalib_idx = np.argmax(avg_p_uncalib)
            pred_uncalib_sp = classes[pred_uncalib_idx]
            conf_uncalib = avg_p_uncalib[pred_uncalib_idx]
            actual_prob_uncalib = avg_p_uncalib[np.where(classes == true_sp)[0][0]]

            avg_p_calib = calib_probs[mask].mean(axis=0)
            pred_calib_idx = np.argmax(avg_p_calib)
            pred_calib_sp = classes[pred_calib_idx]
            conf_calib = avg_p_calib[pred_calib_idx]
            actual_prob_calib = avg_p_calib[np.where(classes == true_sp)[0][0]]

            avg_p_abl = ablated_probs[mask].mean(axis=0)
            pred_abl_sp = classes[np.argmax(avg_p_abl)]

            fold_clip_true.append(true_sp)
            fold_clip_pred.append(pred_calib_sp)
            fold_clip_pred_abl.append(pred_abl_sp)

            oof_clip_id.append(cid)
            oof_clip_true.append(true_sp)
            oof_clip_pred_uncalib.append(pred_uncalib_sp)
            oof_clip_conf_uncalib.append(conf_uncalib)
            oof_clip_actual_prob_uncalib.append(actual_prob_uncalib)
            oof_clip_pred_calib.append(pred_calib_sp)
            oof_clip_conf_calib.append(conf_calib)
            oof_clip_actual_prob_calib.append(actual_prob_calib)
            oof_clip_pred_ablated.append(pred_abl_sp)

        clip_acc = accuracy_score(fold_clip_true, fold_clip_pred)
        clip_acc_abl = accuracy_score(fold_clip_true, fold_clip_pred_abl)
        fold_clip_accs.append(clip_acc)
        fold_clip_accs_ablated.append(clip_acc_abl)
        print(f"  Fold {fold+1}/5 - Triple (3328d): {clip_acc:.2%}, YAMNet+Perch (2560d): {clip_acc_abl:.2%}", flush=True)

    mean_chunk_acc, std_chunk_acc = np.mean(fold_chunk_accs), np.std(fold_chunk_accs)
    mean_clip_acc, std_clip_acc = np.mean(fold_clip_accs), np.std(fold_clip_accs)
    mean_clip_abl, std_clip_abl = np.mean(fold_clip_accs_ablated), np.std(fold_clip_accs_ablated)

    print("\n--------------------------------------------------------", flush=True)
    print(f"5-Fold CV Mean Chunk-Level Accuracy (3328d): {mean_chunk_acc:.2%} ± {std_chunk_acc:.2%}", flush=True)
    print(f"5-Fold CV Mean CLIP Accuracy (3328d Triple):  {mean_clip_acc:.2%} ± {std_clip_acc:.2%}", flush=True)
    print(f"5-Fold CV Mean CLIP Accuracy (2560d YAMNet+Perch): {mean_clip_abl:.2%} ± {std_clip_abl:.2%}", flush=True)
    print("--------------------------------------------------------", flush=True)

    # --- Step 3: Train & Calibrate Final Production Model on Full Dataset ---
    print("\nTraining final production LightGBM + Calibrated Classifier on full dataset...", flush=True)
    full_clip_ids = np.array(sorted({r['clip_id'] for r in clip_records}))
    full_clip_species = np.array([
        next(r['species'] for r in clip_records if r['clip_id'] == clip_id)
        for clip_id in full_clip_ids
    ])
    final_split = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    final_fit_idx, final_cal_idx = next(final_split.split(
        full_clip_ids, full_clip_species, groups=full_clip_ids
    ))
    final_fit_clips = set(full_clip_ids[final_fit_idx])
    final_cal_clips = set(full_clip_ids[final_cal_idx])
    final_fit_records = [r for r in clip_records if r['clip_id'] in final_fit_clips]
    final_cal_records = [
        r for r in clip_records
        if r['clip_id'] in final_cal_clips and not r['is_aug']
    ]
    X_full_tr = np.array([r['embedding'] for r in final_fit_records])
    y_full_tr = np.array([r['species'] for r in final_fit_records])
    X_full_cal = np.array([r['embedding'] for r in final_cal_records])
    y_full_cal = np.array([r['species'] for r in final_cal_records])

    final_lgbm = LGBMClassifier(
        n_estimators=300,
        num_leaves=31,
        reg_alpha=0.1,
        reg_lambda=0.1,
        learning_rate=0.05,
        class_weight='balanced',
        random_state=42,
        verbose=-1
    )
    final_lgbm.fit(X_full_tr, y_full_tr)

    final_calibrated = CalibratedClassifierCV(estimator=final_lgbm, method='sigmoid', cv='prefit')
    final_calibrated.fit(X_full_cal, y_full_cal)

    # --- Step 4: Pre vs Post Calibration Confidence Breakdown per Species ---
    print("\n========================================================", flush=True)
    print("     PROBABILITY CALIBRATION ANALYSIS (PER SPECIES)     ", flush=True)
    print("========================================================", flush=True)

    species_list = sorted(set(oof_clip_true))
    oof_true_arr = np.array(oof_clip_true)
    oof_pred_uncalib_arr = np.array(oof_clip_pred_uncalib)
    oof_conf_uncalib_arr = np.array(oof_clip_conf_uncalib)
    oof_actual_prob_uncalib_arr = np.array(oof_clip_actual_prob_uncalib)
    oof_pred_calib_arr = np.array(oof_clip_pred_calib)
    oof_conf_calib_arr = np.array(oof_clip_conf_calib)
    oof_actual_prob_calib_arr = np.array(oof_clip_actual_prob_calib)
    oof_pred_ablated_arr = np.array(oof_clip_pred_ablated)

    print(f"{'Species':<10} | {'Recall':<6} | {'Uncalib Avg Conf':<20} | {'Calibrated Avg Conf':<20} | {'AST Ablation Acc':<18}")
    print("-" * 88)

    for sp in species_list:
        sp_mask = oof_true_arr == sp
        sp_total = sp_mask.sum()

        avg_conf_uncalib = oof_actual_prob_uncalib_arr[sp_mask].mean()

        corr_calib = sp_mask & (oof_pred_calib_arr == sp)
        avg_conf_calib = oof_actual_prob_calib_arr[sp_mask].mean()
        recall = corr_calib.sum() / sp_total if sp_total > 0 else 0.0

        corr_abl = sp_mask & (oof_pred_ablated_arr == sp)
        acc_abl = corr_abl.sum() / sp_total if sp_total > 0 else 0.0

        print(f"{sp:<10} | {recall:>5.1%}  | {avg_conf_uncalib:>19.1%} | {avg_conf_calib:>19.1%} | {acc_abl:>17.1%}")

    print("\n=== OUT-OF-FOLD CLIP-LEVEL CLASSIFICATION REPORT (3328-dim Triple) ===", flush=True)
    print(classification_report(oof_true_arr, oof_pred_calib_arr), flush=True)

    cm = confusion_matrix(oof_true_arr, oof_pred_calib_arr, labels=species_list)
    print("=== OUT-OF-FOLD CLIP-LEVEL CONFUSION MATRIX ===", flush=True)
    header = "        " + " ".join(f"{l[:6]:>6}" for l in species_list)
    print(header, flush=True)
    for label, row in zip(species_list, cm):
        print(f"{label[:6]:>6}  " + " ".join(f"{v:>6}" for v in row), flush=True)

    print("\n=== MISCLASSIFIED CLIPS SUMMARY (3328-dim Triple) ===", flush=True)
    oof_clip_id_arr = np.array(oof_clip_id)
    clip_id_to_fpath = {r['clip_id']: r.get('fpath', f"clip_{r['clip_id']}") for r in clip_records}
    misclassified_count = 0
    for cid, true_sp, pred_sp, conf in zip(oof_clip_id_arr, oof_true_arr, oof_pred_calib_arr, oof_conf_calib_arr):
        if true_sp != pred_sp:
            misclassified_count += 1
            fpath = clip_id_to_fpath.get(cid, '')
            print(f"  [Misclassified] Clip {cid} ({os.path.basename(fpath)}) | True: {true_sp} -> Pred: {pred_sp} (Conf: {conf:.1%}) | Path: {fpath}", flush=True)
    if misclassified_count == 0:
        print("  None! 100% accuracy on all validation clips.", flush=True)

    print("\n=== MISCLASSIFIED CLIPS SUMMARY (2560-dim YAMNet+Perch Ablated) ===", flush=True)
    mis_abl_count = 0
    for cid, true_sp, pred_sp in zip(oof_clip_id_arr, oof_true_arr, oof_pred_ablated_arr):
        if true_sp != pred_sp:
            mis_abl_count += 1
            fpath = clip_id_to_fpath.get(cid, '')
            print(f"  [Misclassified Ablated] Clip {cid} ({os.path.basename(fpath)}) | True: {true_sp} -> Pred: {pred_sp} | Path: {fpath}", flush=True)
    if mis_abl_count == 0:
        print("  None! 100% accuracy on all validation clips.", flush=True)

    os.makedirs('model', exist_ok=True)
    joblib.dump(final_calibrated, 'model/species_audio_classifier.pkl')
    with open('model/audio_species_labels.json', 'w', encoding='utf-8') as f:
        json.dump(sorted(set(y_full_tr.tolist())), f)

    print("\nSaved model/species_audio_classifier.pkl and model/audio_species_labels.json", flush=True)
    print("NOTE: Model expects 3328-dim triple embeddings (1024 YAMNet + 1536 Perch 2.0 + 768 AST).", flush=True)


if __name__ == '__main__':
    main()
