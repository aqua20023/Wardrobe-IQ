"""
One-time script to generate initial weights for the clothing category classifier.

This creates a MobileNetV2 with an ImageNet-pretrained backbone and a randomly
initialised 7-class head, then saves its state_dict to:
    /ai-service/models/category_classifier.pth

The model produces real softmax probabilities immediately. Replace the .pth file
with domain-fine-tuned weights at any time -- no other code changes required.

Usage (PowerShell):
    cd "e:/Wardrobe IQ/ai-service"
    python scripts/generate_weights.py
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

# Allow imports relative to /ai-service root
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import MobileNet_V2_Weights

from app.ml.labels import CATEGORY_LABELS, NUM_CLASSES

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "models" / "category_classifier.pth"


def build_and_save() -> None:
    logger.info("Building MobileNetV2 with ImageNet pretrained backbone (%d classes)...", NUM_CLASSES)

    # Load pretrained backbone
    model = models.mobilenet_v2(weights=MobileNet_V2_Weights.IMAGENET1K_V1)

    # Replace final classifier head for 7 clothing classes
    in_features: int = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, NUM_CLASSES)

    # Initialise new head with sensible defaults
    nn.init.xavier_uniform_(model.classifier[1].weight)
    nn.init.zeros_(model.classifier[1].bias)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), OUTPUT_PATH)

    logger.info("Weights saved to: %s", OUTPUT_PATH)
    logger.info("Classes: %s", CATEGORY_LABELS)
    logger.info(
        "Note: accuracy will improve after fine-tuning on clothing data. "
        "Replace %s with trained weights to upgrade.", OUTPUT_PATH.name
    )


if __name__ == "__main__":
    build_and_save()
