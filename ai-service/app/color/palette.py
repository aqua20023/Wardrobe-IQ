"""
Color palette mapping.
Defines base colors and provides a utility to snap arbitrary RGB
values to the closest human-readable color name.
"""

import math

# Base palette mapping a human-readable name to its typical RGB centroid.
PALETTE = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "gray": (128, 128, 128),
    "navy": (0, 0, 128),
    "blue": (0, 0, 255),
    "red": (255, 0, 0),
    "green": (0, 128, 0),
    "brown": (165, 42, 42),
    "beige": (245, 245, 220),
    "yellow": (255, 255, 0),
    "pink": (255, 192, 203),
    "purple": (128, 0, 128),
}

def get_closest_color(rgb: tuple[int, int, int] | tuple[float, float, float]) -> str:
    """
    Find the closest color name in the predefined PALETTE using
    Euclidean distance in RGB space.

    Args:
        rgb: A tuple of (R, G, B) values.

    Returns:
        The string name of the closest color.
    """
    r, g, b = rgb
    min_distance = float("inf")
    closest_name = "unknown"

    for name, (pr, pg, pb) in PALETTE.items():
        # Euclidean distance
        distance = math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2)
        if distance < min_distance:
            min_distance = distance
            closest_name = name

    return closest_name
