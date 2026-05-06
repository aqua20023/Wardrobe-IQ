import axios from "axios";
import { env } from "../config/env";
import { mapAiLabelToCategory, type WardrobeCategory } from "./ai.label-mapper";

/** Shape of the FastAPI POST /predict/category response. */
interface FastApiPrediction {
  category: string; // raw AI label e.g. "shirt", "jeans"
  confidence: number; // softmax probability 0–1
}

/** Normalised prediction consumed by the rest of the backend. */
export interface AiPrediction {
  /** Mapped wardrobe-schema category (e.g. "tops", "bottoms"). */
  category: WardrobeCategory;
  /** Raw label the model returned before mapping (e.g. "shirt"). */
  rawLabel: string;
  /** Softmax confidence score 0–1. */
  confidence: number;
}

const PREDICT_ENDPOINT = `${env.AI_SERVICE_URL}/predict/category`;
const REQUEST_TIMEOUT_MS = 10_000; // don't block uploads on a slow AI service

/**
 * Calls the FastAPI AI service to predict the clothing category for a given image URL.
 *
 * - Maps the raw AI label to the wardrobe schema category via `mapAiLabelToCategory`.
 * - Returns a safe fallback prediction (category: "other", confidence: 0) if the
 *   service is unreachable or returns an error — the upload flow must not be blocked.
 *
 * @param imageUrl - Publicly accessible Cloudinary URL of the uploaded image.
 */
export async function predictCategory(imageUrl: string): Promise<AiPrediction> {
  try {
    const response = await axios.post<FastApiPrediction>(
      PREDICT_ENDPOINT,
      { image_url: imageUrl },
      { timeout: REQUEST_TIMEOUT_MS }
    );

    const { category: rawLabel, confidence } = response.data;
    const category = mapAiLabelToCategory(rawLabel);

    return { category, rawLabel, confidence };
  } catch (error) {
    console.error("[AI Service] predictCategory failed:", (error as Error).message);
    return { category: "other", rawLabel: "unknown", confidence: 0 };
  }
}