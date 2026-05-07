"""
Wardrobe IQ — AI Service
========================
FastAPI application exposing ML inference endpoints.

Startup behaviour:
    The clothing category model is loaded once via the `lifespan` context manager
    and kept in memory for the lifetime of the process.  No per-request loading.

Endpoints:
    GET  /health             – liveness probe
    POST /predict/category   – clothing category classification
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
import time
from typing import AsyncGenerator

import torch
import torch.nn as nn
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

# Limit threads to prevent catastrophic thrashing on Render's 0.1 CPU limits
torch.set_num_threads(1)

from app.color import extract_dominant_colors
from app.common.image import download_image
from app.ml.inference import predict
from app.ml.model_loader import load_model
from app.ml.preprocess import preprocess_from_url

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application state
# ---------------------------------------------------------------------------

class _AppState:
    model: nn.Module | None = None


state = _AppState()

# ---------------------------------------------------------------------------
# Lifespan (model loaded once at startup)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Load the category classifier on startup; release on shutdown."""
    logger.info("Starting up — loading category classifier...")
    try:
        state.model = load_model()
        logger.info("Category classifier ready.")
    except Exception as exc:
        logger.error("Failed to load category classifier: %s", exc)
        # Allow the app to start; /predict/category will return the error fallback.
        state.model = None
    yield
    logger.info("Shutting down AI service.")
    state.model = None


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Wardrobe IQ AI Service",
    version="1.0.0",
    description="Production ML inference service for clothing classification.",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ImageRequest(BaseModel):
    image_url: str  # kept as str to match existing contract; validated at use-site


class CategoryResponse(BaseModel):
    category: str
    confidence: float


class ColorResponse(BaseModel):
    primary_color: str
    secondary_colors: list[str]


_FALLBACK_CATEGORY = CategoryResponse(category="unknown", confidence=0.0)
_FALLBACK_COLOR = ColorResponse(primary_color="unknown", secondary_colors=[])

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["ops"])
def health_check() -> dict:
    model_loaded = state.model is not None
    return {
        "status": "ok",
        "service": "Wardrobe IQ AI Service",
        "model_loaded": model_loaded,
    }


@app.post("/predict/category", response_model=CategoryResponse, tags=["inference"])
def predict_category(payload: ImageRequest) -> CategoryResponse:
    """
    Predict the clothing category for the image at `image_url`.

    Returns the top-1 predicted class and its softmax confidence score.
    On any failure (download error, invalid image, model error) returns:
        { "category": "unknown", "confidence": 0.0 }
    """
    t_start = time.perf_counter()
    logger.info("[AI Category] request received")
    
    if state.model is None:
        logger.warning("predict_category called but model is not loaded.")
        return _FALLBACK_CATEGORY

    try:
        tensor = preprocess_from_url(payload.image_url)
    except ValueError as exc:
        logger.warning("Image validation failed for %s: %s", payload.image_url, exc)
        return _FALLBACK_CATEGORY
    except Exception as exc:
        logger.warning("Image download/decode failed for %s: %s", payload.image_url, exc)
        return _FALLBACK_CATEGORY

    try:
        label, confidence = predict(state.model, tensor)
    except Exception as exc:
        logger.error("Model inference failed: %s", exc)
        return _FALLBACK_CATEGORY

    t_end = time.perf_counter()
    logger.info("[AI Category] response return (%.0fms total)", (t_end - t_start) * 1000)
    return CategoryResponse(category=label, confidence=confidence)


@app.post("/predict/color", response_model=ColorResponse, tags=["inference"])
def predict_color(payload: ImageRequest) -> ColorResponse:
    """
    Extract the dominant colors for the image at `image_url`.

    Returns the primary color and up to 2 secondary colors.
    On any failure (download error, invalid image, clustering error) returns:
        { "primary_color": "unknown", "secondary_colors": [] }
    """
    try:
        image = download_image(payload.image_url)
    except ValueError as exc:
        logger.warning("Color extraction image validation failed for %s: %s", payload.image_url, exc)
        return _FALLBACK_COLOR
    except Exception as exc:
        logger.warning("Color extraction image download failed for %s: %s", payload.image_url, exc)
        return _FALLBACK_COLOR

    try:
        primary, secondary = extract_dominant_colors(image)
    except Exception as exc:
        logger.error("Color extraction failed: %s", exc)
        return _FALLBACK_COLOR

    return ColorResponse(primary_color=primary, secondary_colors=secondary)