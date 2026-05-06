"""
Color palette mapping.
Defines base colors and provides a utility to snap arbitrary RGB
values to the closest human-readable color name.
"""

import math

# Base palette mapping a human-readable name to its typical RGB centroid.
PALETTE = {
    # Neutrals
    "black": (0, 0, 0),
    "charcoal": (54, 69, 79),
    "gray": (128, 128, 128),
    "silver": (192, 192, 192),
    "white": (255, 255, 255),
    "ivory": (255, 255, 240),
    "cream": (255, 253, 208),
    "beige": (245, 245, 220),
    "tan": (210, 180, 140),
    "khaki": (195, 176, 145),

    # Blues
    "navy": (0, 0, 128),
    "cobalt": (0, 71, 171),
    "blue": (0, 0, 255),
    "sky blue": (135, 206, 235),
    "teal": (0, 128, 128),

    # Reds / Pinks
    "red": (255, 0, 0),
    "maroon": (128, 0, 0),
    "burgundy": (128, 0, 32),
    "pink": (255, 192, 203),
    "blush": (222, 93, 131),

    # Greens
    "green": (0, 128, 0),
    "olive": (128, 128, 0),
    "sage": (188, 184, 138),

    # Yellows / Oranges
    "yellow": (255, 255, 0),
    "mustard": (255, 219, 88),
    "orange": (255, 165, 0),
    "rust": (183, 65, 14),

    # Browns
    "brown": (165, 42, 42),
    "camel": (193, 154, 107),
    "taupe": (72, 60, 50),

    # Purples
    "purple": (128, 0, 128),
    "lavender": (230, 230, 250),
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
