"""
Image preprocessing pipeline for the clothing category classifier.

Pipeline:
    URL → bytes → PIL.Image (RGB) → Resize(256) → CenterCrop(224)
    → ToTensor → Normalize(ImageNet mean/std)

Output: FloatTensor of shape (1, 3, 224, 224), ready for model inference.
"""

from __future__ import annotations

import io
import logging

import requests
import torch
from PIL import Image
from torchvision import transforms

logger = logging.getLogger(__name__)

# ImageNet normalization constants
_IMAGENET_MEAN = (0.485, 0.456, 0.406)
_IMAGENET_STD = (0.229, 0.224, 0.225)

_DOWNLOAD_TIMEOUT_SECONDS = 10
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB guard

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
    logger.debug("Downloading image from %s", image_url)

    response = requests.get(
        image_url,
        timeout=_DOWNLOAD_TIMEOUT_SECONDS,
        stream=True,
    )
    response.raise_for_status()

    # Guard against excessively large payloads
    raw = response.content
    if len(raw) > _MAX_IMAGE_BYTES:
        raise ValueError(
            f"Image exceeds maximum allowed size of {_MAX_IMAGE_BYTES // (1024 * 1024)} MB."
        )

    image = Image.open(io.BytesIO(raw)).convert("RGB")
    tensor: torch.Tensor = _transform(image)
    return tensor.unsqueeze(0)  # add batch dimension → (1, 3, 224, 224)
