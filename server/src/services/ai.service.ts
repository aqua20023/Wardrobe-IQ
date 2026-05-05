import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export const predictCategory = async (imageUrl: string) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict/category`, {
      image_url: imageUrl,
    });

    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      category: "unknown",
      confidence: 0,
    };
  }
};