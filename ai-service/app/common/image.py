"""
Shared utility for downloading images across different ML pipelines.
"""

from __future__ import annotations

import io
import logging

import requests
from PIL import Image

logger = logging.getLogger(__name__)

_DOWNLOAD_TIMEOUT_SECONDS = 10
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB guard


def download_image(image_url: str) -> Image.Image:
    """
    Download an image from `image_url` and return a PIL Image in RGB format.

    Args:
        image_url: Publicly accessible URL pointing to an image.

    Returns:
        PIL.Image in RGB mode.

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
    return image
