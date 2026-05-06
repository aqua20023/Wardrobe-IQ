import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export interface AiPrediction {
  category: string;
  confidence: number;
}

/**
 * Calls the FastAPI AI service to predict the clothing category for a given image URL.
 * Returns a fallback prediction with confidence 0 if the service is unavailable.
 */
export async function predictCategory(imageUrl: string): Promise<AiPrediction> {
  if (!AI_SERVICE_URL) {
    console.warn("[AI Service] AI_SERVICE_URL is not configured — skipping prediction.");
    return { category: "unknown", confidence: 0 };
  }

  try {
    const response = await axios.post<AiPrediction>(
      `${AI_SERVICE_URL}/predict/category`,
      { image_url: imageUrl },
      { timeout: 10_000 } // 10 s — don't block uploads on a slow AI service
    );
    return response.data;
  } catch (error) {
    console.error("[AI Service] predictCategory failed:", (error as Error).message);
    return { category: "unknown", confidence: 0 };
  }
}