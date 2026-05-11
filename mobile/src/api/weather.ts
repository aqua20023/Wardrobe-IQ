import axios from "axios";

export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "misty" | "unknown";

export type WeatherData = {
  temperature: number;
  conditionCode: number;
  conditionText: string;
  type: WeatherCondition;
  humidity?: number;
  windSpeed?: number;
};

function mapWmoToCondition(code: number): { text: string; type: WeatherCondition } {
  // 0 Clear sky
  if (code === 0) return { text: "Clear", type: "sunny" };
  // 1, 2, 3 Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) return { text: "Partly Cloudy", type: "cloudy" };
  // 45, 48 Fog and depositing rime fog
  if (code === 45 || code === 48) return { text: "Foggy", type: "misty" };
  // 51, 53, 55 Drizzle
  if (code >= 51 && code <= 55) return { text: "Drizzle", type: "rainy" };
  // 61, 63, 65 Rain
  if (code >= 61 && code <= 65) return { text: "Rain", type: "rainy" };
  // 66, 67 Freezing Rain
  if (code >= 66 && code <= 67) return { text: "Freezing Rain", type: "rainy" };
  // 71, 73, 75 Snow fall
  if (code >= 71 && code <= 75) return { text: "Snow", type: "snowy" };
  // 77 Snow grains
  if (code === 77) return { text: "Snow grains", type: "snowy" };
  // 80, 81, 82 Rain showers
  if (code >= 80 && code <= 82) return { text: "Showers", type: "rainy" };
  // 85, 86 Snow showers
  if (code >= 85 && code <= 86) return { text: "Snow Showers", type: "snowy" };
  // 95 * Thunderstorm
  if (code >= 95 && code <= 99) return { text: "Thunderstorm", type: "stormy" };

  return { text: "Atmosphere", type: "unknown" };
}

export const weatherApi = {
  async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const current = response.data.current;
    
    const { text, type } = mapWmoToCondition(current.weather_code);
    
    return {
      temperature: Math.round(current.temperature_2m),
      conditionCode: current.weather_code,
      conditionText: text,
      type,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m
    };
  }
};
