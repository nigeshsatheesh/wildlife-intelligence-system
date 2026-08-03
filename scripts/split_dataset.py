# split_dataset.py
import os, shutil, random

SOURCE_DIR = "data/raw-images"
TRAIN_DIR = "data/train"
VAL_DIR = "data/val"
VAL_SPLIT = 0.2  # 20% for validation

random.seed(42)  # reproducible split

for species in os.listdir(SOURCE_DIR):
    species_path = os.path.join(SOURCE_DIR, species)
    if not os.path.isdir(species_path):
        continue

    images = os.listdir(species_path)
    random.shuffle(images)
    val_count = int(len(images) * VAL_SPLIT)
    val_images = images[:val_count]
    train_images = images[val_count:]

    os.makedirs(os.path.join(TRAIN_DIR, species), exist_ok=True)
    os.makedirs(os.path.join(VAL_DIR, species), exist_ok=True)

    for img in train_images:
        shutil.copy(os.path.join(species_path, img), os.path.join(TRAIN_DIR, species, img))
    for img in val_images:
        shutil.copy(os.path.join(species_path, img), os.path.join(VAL_DIR, species, img))

    print(f"{species}: {len(train_images)} train, {len(val_images)} val")