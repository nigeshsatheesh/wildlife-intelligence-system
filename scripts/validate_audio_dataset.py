"""Validate provenance and minimum coverage for the species audio dataset.

The audio files are intentionally kept outside Git. Download genuine field
recordings from an approved source, then describe each file in a JSON manifest
before running train_audio.py.
"""
import argparse
import json
import os
import sys
from collections import Counter

AUDIO_EXTENSIONS = {".wav", ".mp3", ".ogg", ".flac", ".m4a"}
REQUIRED_FIELDS = {"species", "filename", "source", "source_url", "license", "recording_type"}
FORBIDDEN_MARKERS = (
    "cinematic",
    "sound-effect",
    "sound_effect",
    "sfx",
    "sound design",
    "sound-design",
    "foley",
    "royalty-free-effect",
)


def validate(dataset_dir: str, manifest_path: str, minimum_per_species: int) -> int:
    with open(manifest_path, encoding="utf-8") as manifest_file:
        records = json.load(manifest_file)

    if not isinstance(records, list):
        raise ValueError("The manifest root must be a JSON array.")

    errors = []
    manifest_files = set()
    counts = Counter()
    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            errors.append(f"record {index}: expected an object")
            continue
        missing = REQUIRED_FIELDS - record.keys()
        if missing:
            errors.append(f"record {index}: missing {', '.join(sorted(missing))}")
            continue

        filename = record["filename"]
        relative_path = os.path.join(record["species"], filename)
        manifest_files.add(relative_path)
        counts[record["species"]] += 1
        if record["recording_type"].lower() != "field recording":
            errors.append(f"{relative_path}: recording_type must be 'field recording'")
        if not record["source_url"].startswith(("https://", "http://")):
            errors.append(f"{relative_path}: source_url must be an HTTP(S) URL")
        if not record["license"].strip():
            errors.append(f"{relative_path}: license must not be empty")
        if any(marker in filename.lower() for marker in FORBIDDEN_MARKERS):
            errors.append(f"{relative_path}: filename contains a stock/SFX marker")
        if not os.path.isfile(os.path.join(dataset_dir, relative_path)):
            errors.append(f"{relative_path}: audio file is missing")

    for species, count in sorted(counts.items()):
        if count < minimum_per_species:
            errors.append(f"{species}: {count} manifest records; need at least {minimum_per_species}")

    for root, _, filenames in os.walk(dataset_dir):
        for filename in filenames:
            if os.path.splitext(filename)[1].lower() not in AUDIO_EXTENSIONS:
                continue
            relative_path = os.path.relpath(os.path.join(root, filename), dataset_dir)
            if relative_path not in manifest_files:
                errors.append(f"{relative_path}: missing from source manifest")

    if errors:
        print("Audio dataset validation failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print(f"Audio dataset valid: {sum(counts.values())} clips across {len(counts)} species")
    print("Per-species counts:", dict(sorted(counts.items())))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset-dir", default="data/audio-train-clean")
    parser.add_argument("--manifest", default="data/audio-train-clean/source_manifest.json")
    parser.add_argument("--minimum-per-species", type=int, default=30)
    args = parser.parse_args()
    try:
        return validate(args.dataset_dir, args.manifest, args.minimum_per_species)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Audio dataset validation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
