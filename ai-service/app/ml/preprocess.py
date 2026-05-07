"""
Image preprocessing pipeline for the clothing category classifier.

Pipeline:
    URL → bytes → PIL.Image (RGB) → Resize(256) → CenterCrop(224)
    → ToTensor → Normalize(ImageNet mean/std)

Output: FloatTensor of shape (1, 3, 224, 224), ready for model inference.
"""

from __future__ import annotations

import logging
import time

import torch
from torchvision import transforms

from app.common.image import download_image

logger = logging.getLogger(__name__)

# ImageNet normalization constants
_IMAGENET_MEAN = (0.485, 0.456, 0.406)
_IMAGENET_STD = (0.229, 0.224, 0.225)

_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=_IMAGENET_MEAN, std=_IMAGENET_STD),
])


def preprocess_from_url(image_url: str) -> torch.Tensor:
    """
    Download an image from `image_url` and return a preprocessed tensor.

    Args:
        image_url: Publicly accessible URL pointing to a clothing image.

    Returns:
        FloatTensor of shape (1, 3, 224, 224).

    Raises:
        requests.RequestException: on network/HTTP errors.
        OSError: if the response body is not a valid image.
        ValueError: if the downloaded content exceeds the size limit.
    """
    image = download_image(image_url)
    
    logger.info("[AI Category] preprocess start")
    t0 = time.perf_counter()
    tensor: torch.Tensor = _transform(image)
    t1 = time.perf_counter()
    logger.info("[AI Category] preprocess complete (%.0fms)", (t1 - t0) * 1000)
    
    return tensor.unsqueeze(0)  # add batch dimension → (1, 3, 224, 224)
