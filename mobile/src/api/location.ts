import * as Location from "expo-location";

export type GeoLocation = {
  latitude: number;
  longitude: number;
  city: string;
  country?: string;
};

export const locationApi = {
  async getCurrentLocation(): Promise<GeoLocation> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    const { latitude, longitude } = location.coords;
    
    // Reverse geocode to get city name
    let city = "Unknown Location";
    let country = undefined;
    
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        city = place.city || place.subregion || place.district || place.region || "Unknown";
        country = place.country || undefined;
      }
    } catch (error) {
      console.warn("Geocoding failed:", error);
    }

    return { latitude, longitude, city, country };
  },

  async searchLocations(query: string): Promise<GeoLocation[]> {
    if (!query || query.length < 2) return [];
    
    try {
      const results = await Location.geocodeAsync(query);
      
      // Batch reverse geocoding isn't strictly supported elegantly for multiple points fast,
      // but we can pick the first few matches.
      const finalResults: GeoLocation[] = [];
      
      for (const res of results.slice(0, 3)) {
        const [place] = await Location.reverseGeocodeAsync({ 
          latitude: res.latitude, 
          longitude: res.longitude 
        });
        
        if (place) {
          finalResults.push({
            latitude: res.latitude,
            longitude: res.longitude,
            city: place.city || place.subregion || place.region || query,
            country: place.country || undefined
          });
        } else {
          finalResults.push({
            latitude: res.latitude,
            longitude: res.longitude,
            city: query
          });
        }
      }
      return finalResults;
    } catch (error) {
      console.error("Location search failed:", error);
      return [];
    }
  }
};
