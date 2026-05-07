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

export interface AiColorPrediction {
  primaryColor: string;
  secondaryColors: string[];
}

const PREDICT_CATEGORY_ENDPOINT = `${env.AI_SERVICE_URL}/predict/category`;
const PREDICT_COLOR_ENDPOINT = `${env.AI_SERVICE_URL}/predict/color`;
const CATEGORY_TIMEOUT_MS = 60_000; // Allow category up to 60s to survive heavy Render PyTorch cold starts
const COLOR_TIMEOUT_MS = 3_000; // Color is best-effort, strict timeout

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
  const requestPayload = { image_url: imageUrl };
  console.log("[AI Service] Category prediction request start:", JSON.stringify({
    endpoint: PREDICT_CATEGORY_ENDPOINT,
    payload: requestPayload,
  }, null, 2));

  try {
    const response = await axios.post<FastApiPrediction>(
      PREDICT_CATEGORY_ENDPOINT,
      requestPayload,
      { timeout: CATEGORY_TIMEOUT_MS }
    );
    
    console.log("[AI Service] Category prediction success:", JSON.stringify({
      status: response.status,
      body: response.data
    }, null, 2));

    const { category: rawLabel, confidence } = response.data;
    const category = mapAiLabelToCategory(rawLabel);

    return { category, rawLabel, confidence };
  } catch (error) {
    const failureDetails = {
      message: (error as Error).message,
      code: axios.isAxiosError(error) ? error.code : "UNKNOWN",
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      responseData: axios.isAxiosError(error) ? error.response?.data : undefined,
      stack: (error as Error).stack,
      predictor: "category"
    };
    console.error("[AI Service] Category prediction EXACT FAILURE:", JSON.stringify(failureDetails, null, 2));
    return { category: "other", rawLabel: "unknown", confidence: 0 };
  }
}

/**
 * Calls the FastAPI AI service to extract dominant colors for a given image URL.
 *
 * - Returns a safe fallback (primaryColor: "unknown", secondaryColors: []) if the
 *   service is unreachable or returns an error.
 *
 * @param imageUrl - Publicly accessible Cloudinary URL of the uploaded image.
 */
export async function predictColor(imageUrl: string): Promise<AiColorPrediction> {
  const requestPayload = { image_url: imageUrl };
  console.log("[AI Service] Color prediction request start:", JSON.stringify({
    endpoint: PREDICT_COLOR_ENDPOINT,
    payload: requestPayload,
  }, null, 2));

  try {
    const response = await axios.post<{ primary_color: string; secondary_colors: string[] }>(
      PREDICT_COLOR_ENDPOINT,
      requestPayload,
      { timeout: COLOR_TIMEOUT_MS }
    );

    console.log("[AI Service] Color prediction success:", JSON.stringify({
      status: response.status,
      body: response.data
    }, null, 2));
    
    const { primary_color, secondary_colors } = response.data;
    return { primaryColor: primary_color, secondaryColors: secondary_colors };
  } catch (error) {
    const failureDetails = {
      message: (error as Error).message,
      code: axios.isAxiosError(error) ? error.code : "UNKNOWN",
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      responseData: axios.isAxiosError(error) ? error.response?.data : undefined,
      stack: (error as Error).stack,
      predictor: "color"
    };
    console.error("[AI Service] Color prediction EXACT FAILURE:", JSON.stringify(failureDetails, null, 2));
    return { primaryColor: "unknown", secondaryColors: [] };
  }
}