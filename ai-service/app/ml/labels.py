"""
Centralized class label mapping for the clothing category classifier.

Order must exactly match the output units of the trained model head.
To add a new class, append to CATEGORY_LABELS and retrain the model.
"""

CATEGORY_LABELS: list[str] = [
    "jacket",
    "shirt",
    "t-shirt",
]

NUM_CLASSES: int = len(CATEGORY_LABELS)
