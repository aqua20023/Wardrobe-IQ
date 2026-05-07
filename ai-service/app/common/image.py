"""
Shared utility for downloading images across different ML pipelines.
"""

from __future__ import annotations

import io
import logging
import time

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
    logger.info("[AI Category] image download start")
    
    t0 = time.perf_counter()
    response = requests.get(
        image_url,
        timeout=_DOWNLOAD_TIMEOUT_SECONDS,
        stream=True,
    )
    response.raise_for_status()
    t1 = time.perf_counter()
    logger.info("[AI Category] image HTTP GET complete (%.0fms)", (t1 - t0) * 1000)

    # Guard against excessively large payloads
    raw = response.content
    t2 = time.perf_counter()
    logger.info("[AI Category] image HTTP body read complete (%.0fms)", (t2 - t1) * 1000)
    logger.info("[AI Category] image download complete (%.0fms)", (t2 - t0) * 1000)

    if len(raw) > _MAX_IMAGE_BYTES:
        raise ValueError(
            f"Image exceeds maximum allowed size of {_MAX_IMAGE_BYTES // (1024 * 1024)} MB."
        )

    logger.info("[AI Category] PIL decode start")
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    t3 = time.perf_counter()
    logger.info("[AI Category] PIL decode complete (%.0fms)", (t3 - t2) * 1000)
    
    return image
