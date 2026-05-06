from pathlib import Path
from collections import defaultdict
from sklearn.model_selection import train_test_split
import shutil
import random

# -----------------------------
# CONFIG
# -----------------------------
LABEL_MAP = {
    "Jacket": "jacket",
    "Warm clothes": "jacket",
    "Shirt": "shirt",
    "Polo shirt": "shirt",
    "T-shirt": "t-shirt",
    "Tank top": "t-shirt",
}

RAW_DIR = Path("data/dataset_a_raw/clothing-dataset")
OUT_DIR = Path("data/dataset_a_processed")

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

RANDOM_SEED = 42
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

random.seed(RANDOM_SEED)


# -----------------------------
# HELPERS
# -----------------------------
def reset_output_dir():
    """Delete existing processed dataset and recreate clean folder structure."""
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)

    for split in ["train", "val", "test"]:
        for cls in ["jacket", "shirt", "t-shirt"]:
            (OUT_DIR / split / cls).mkdir(parents=True, exist_ok=True)


def collect_images():
    """
    Collect all valid images from raw folders and remap them into
    Wardrobe IQ classes using LABEL_MAP.
    """
    grouped = defaultdict(list)

    for raw_folder, mapped_class in LABEL_MAP.items():
        folder_path = RAW_DIR / raw_folder

        if not folder_path.exists():
            print(f"[WARN] Missing folder: {folder_path}")
            continue

        for file_path in folder_path.iterdir():
            if file_path.suffix.lower() in VALID_EXTENSIONS:
                grouped[mapped_class].append(file_path)

    return grouped


def split_images(image_paths):
    """
    Split images into train / val / test.
    70 / 15 / 15 split
    """
    train_imgs, temp_imgs = train_test_split(
        image_paths,
        test_size=(1 - TRAIN_RATIO),
        random_state=RANDOM_SEED,
        shuffle=True,
    )

    val_imgs, test_imgs = train_test_split(
        temp_imgs,
        test_size=(TEST_RATIO / (VAL_RATIO + TEST_RATIO)),
        random_state=RANDOM_SEED,
        shuffle=True,
    )

    return train_imgs, val_imgs, test_imgs


def copy_split(images, split, cls_name):
    """Copy image files into processed dataset split folders."""
    out_path = OUT_DIR / split / cls_name

    for img_path in images:
        shutil.copy2(img_path, out_path / img_path.name)


# -----------------------------
# MAIN
# -----------------------------
def main():
    print("\nPreparing Dataset A...\n")

    reset_output_dir()
    grouped_images = collect_images()

    for cls_name, image_paths in grouped_images.items():
        print(f"[INFO] {cls_name}: {len(image_paths)} images found")

        train_imgs, val_imgs, test_imgs = split_images(image_paths)

        copy_split(train_imgs, "train", cls_name)
        copy_split(val_imgs, "val", cls_name)
        copy_split(test_imgs, "test", cls_name)

        print(
            f"[DONE] {cls_name} -> "
            f"train={len(train_imgs)}, val={len(val_imgs)}, test={len(test_imgs)}"
        )

    print("\nDataset A processing complete.")
    print(f"Processed dataset saved to: {OUT_DIR.resolve()}\n")


if __name__ == "__main__":
    main()