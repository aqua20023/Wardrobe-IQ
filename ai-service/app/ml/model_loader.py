"""
Model loader for the clothing category classifier.

Responsibilities:
- Build MobileNetV2 architecture with a dynamic n-class head.
- Load fine-tuned weights from disk (once at startup).
- Return the model in eval() mode, ready for inference.

Usage:
    from app.ml.model_loader import load_model
    model = load_model()   # call inside FastAPI lifespan
"""

from __future__ import annotations

import logging
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models

from app.ml.labels import NUM_CLASSES

logger = logging.getLogger(__name__)

# Resolved relative to this file so it works regardless of CWD
_WEIGHTS_PATH = Path(__file__).resolve().parents[2] / "models" / "category_classifier.pth"


def _build_mobilenetv2(num_classes: int) -> nn.Module:
    """Return a MobileNetV2 with the final classifier head replaced."""
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    return model


def load_model() -> nn.Module:
    """
    Load the clothing classifier from disk.

    Returns:
        nn.Module in eval() mode on CPU.

    Raises:
        FileNotFoundError: if the weights file is missing.
        RuntimeError: if the weights cannot be loaded into the model.
    """
    if not _WEIGHTS_PATH.exists():
        raise FileNotFoundError(
            f"Model weights not found at {_WEIGHTS_PATH}. "
            "Run `python scripts/generate_weights.py` to create initial weights."
        )

    logger.info("Loading category classifier from %s", _WEIGHTS_PATH)

    model = _build_mobilenetv2(NUM_CLASSES)

    state_dict = torch.load(_WEIGHTS_PATH, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()

    logger.info("Category classifier loaded successfully (%d classes)", NUM_CLASSES)
    return model
