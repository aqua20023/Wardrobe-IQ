"""
Inference logic for the clothing category classifier.

Accepts a loaded nn.Module and a preprocessed image tensor.
Returns the predicted class label and its softmax confidence score.
"""

from __future__ import annotations

import logging
import time

import torch
import torch.nn as nn
import torch.nn.functional as F

from app.ml.labels import CATEGORY_LABELS

logger = logging.getLogger(__name__)


def predict(model: nn.Module, tensor: torch.Tensor) -> tuple[str, float]:
    """
    Run a single inference pass and return the top predicted class.

    Args:
        model:  A loaded nn.Module in eval() mode.
        tensor: Preprocessed FloatTensor of shape (1, 3, 224, 224).

    Returns:
        A tuple of (label, confidence) where:
            label      – one of the strings in CATEGORY_LABELS
            confidence – softmax probability in [0, 1]

    Raises:
        RuntimeError: if the model forward pass fails.
        IndexError:   if the predicted index is out of range.
    """
    logger.info("[AI Category] inference start")
    t0 = time.perf_counter()
    with torch.no_grad():
        logits: torch.Tensor = model(tensor)          # (1, num_classes)
        t1 = time.perf_counter()
        logger.info("[AI Category] forward pass complete (%.0fms)", (t1 - t0) * 1000)
        
        logger.info("[AI Category] softmax start")
        probabilities = F.softmax(logits, dim=1)      # (1, num_classes)
        t2 = time.perf_counter()
        logger.info("[AI Category] softmax complete (%.0fms)", (t2 - t1) * 1000)
        
        confidence_tensor, class_idx_tensor = probabilities.max(dim=1)
    logger.info("[AI Category] inference complete (%.0fms)", (t2 - t0) * 1000)

    class_idx: int = class_idx_tensor.item()
    confidence: float = round(float(confidence_tensor.item()), 4)
    label: str = CATEGORY_LABELS[class_idx]

    logger.debug("Predicted class=%s (idx=%d) confidence=%.4f", label, class_idx, confidence)
    return label, confidence
