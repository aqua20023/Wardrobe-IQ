from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Wardrobe IQ AI Service", version="1.0.0")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Wardrobe IQ AI Service"}


class ImageRequest(BaseModel):
    image_url: str


@app.post("/predict/category")
def predict_category(payload: ImageRequest):
    return {
        "category": "shirt",
        "confidence": 0.93
    }