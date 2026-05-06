"""
Color extraction logic using KMeans clustering.
"""

from __future__ import annotations

import collections
import logging

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

from app.color.palette import get_closest_color

logger = logging.getLogger(__name__)

_WORKING_SIZE = (150, 150)
_NUM_CLUSTERS = 3


def extract_dominant_colors(image: Image.Image) -> tuple[str, list[str]]:
    """
    Extract the dominant colors from an image using KMeans clustering.

    Args:
        image: A PIL Image in RGB format.

    Returns:
        A tuple of (primary_color, [secondary_colors...]).
    """
    # 1. Resize for performance and flatten to a list of RGB pixels
    img_resized = image.resize(_WORKING_SIZE)
    img_data = np.array(img_resized)
    pixels = img_data.reshape(-1, 3)

    # 2. Cluster into dominant colors
    logger.debug("Running KMeans clustering with k=%d", _NUM_CLUSTERS)
    kmeans = KMeans(n_clusters=_NUM_CLUSTERS, random_state=42, n_init=10)
    kmeans.fit(pixels)

    # 3. Sort clusters by frequency (most common first)
    counts = collections.Counter(kmeans.labels_)
    sorted_cluster_indices = [idx for idx, _ in counts.most_common()]

    # 4. Map cluster centroids to closest human-readable colors
    ordered_colors = []
    for cluster_idx in sorted_cluster_indices:
        centroid = kmeans.cluster_centers_[cluster_idx]
        color_name = get_closest_color(centroid)
        ordered_colors.append(color_name)

    # 5. Deduplicate while preserving order
    unique_colors = []
    for color in ordered_colors:
        if color not in unique_colors:
            unique_colors.append(color)

    # 6. Format primary vs secondary
    if not unique_colors:
        return "unknown", []

    primary = unique_colors[0]
    secondary = unique_colors[1:]

    return primary, secondary
