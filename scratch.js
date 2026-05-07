const axios = require('axios');

async function test() {
  console.log("Testing AI Service directly...");
  try {
    const response = await axios.post(
      "https://wardrobe-iq-ai.onrender.com/predict/category",
      { image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&auto=format&fit=crop" },
      { timeout: 60000 }
    );
    console.log("Success:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("Error response status:", error.response.status);
      console.log("Error response data:", error.response.data);
    } else {
      console.log("Error message:", error.message);
      console.log("Error code:", error.code);
    }
  }
}
test();
