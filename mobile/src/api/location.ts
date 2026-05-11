import * as Location from "expo-location";

export type GeoLocation = {
  latitude: number;
  longitude: number;
  city: string;
  country?: string;
};

/**
 * SAFELY executes the reverseGeocodeAsync call to shield from Android native crashes.
 * e.g., NullPointerExceptions during getCountryCode on emulators/VPNs.
 */
async function safeReverseGeocode(latitude: number, longitude: number): Promise<Location.LocationGeocodedAddress | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      console.log("[Location] Empty reverse geocode result array.");
      return null;
    }

    const firstResult = results[0];
    if (!firstResult) {
      return null;
    }

    return firstResult;
  } catch (error) {
    // Capture native exception (like getCountryCode must not be null) elegantly.
    console.log("[Location] Native reverseGeocodeAsync rejected:", error);
    return null;
  }
}

/**
 * Decodes address fields defensively avoiding assumption that structure is intact.
 */
function extractDefensiveName(place: Location.LocationGeocodedAddress | null, fallback: string) {
  if (!place) return { city: fallback, country: undefined };

  const parsedCity = place.city || place.district || place.subregion || place.region || fallback;
  // Ensure fields returning as string "null" or purely empty don't persist incorrectly
  const finalCity = parsedCity && typeof parsedCity === "string" ? parsedCity : fallback;
  
  const country = place.country || place.isoCountryCode || undefined;
  const finalCountry = country && typeof country === "string" ? country : undefined;

  return { city: finalCity, country: finalCountry };
}

export const locationApi = {
  async getCurrentLocation(): Promise<GeoLocation> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    let location;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
    } catch (e) {
      console.log("[Location] Failed to fetch GPS coordinates:", e);
      throw new Error("GPS inaccessible");
    }

    const { latitude, longitude } = location.coords;
    
    // Use our super safe wrapper
    const place = await safeReverseGeocode(latitude, longitude);
    const { city, country } = extractDefensiveName(place, "Location unavailable");

    return { latitude, longitude, city, country };
  },

  async searchLocations(query: string): Promise<GeoLocation[]> {
    if (!query || query.trim().length < 2) return [];
    
    try {
      const results = await Location.geocodeAsync(query);
      
      if (!results || !Array.isArray(results) || results.length === 0) {
        console.log("[Location] Empty forward geocode result");
        return [];
      }

      const finalResults: GeoLocation[] = [];
      
      // Take first 3 matches
      const limitedResults = results.slice(0, 3);
      
      for (const res of limitedResults) {
        // Guard individual geocoding loops so ONE failed lookup doesn't nuke remaining matches!
        const place = await safeReverseGeocode(res.latitude, res.longitude);
        
        const { city, country } = extractDefensiveName(place, query);
        
        finalResults.push({
          latitude: res.latitude,
          longitude: res.longitude,
          city,
          country
        });
      }
      
      return finalResults;
    } catch (error) {
      // Log gracefully - do NOT explode global stack traces
      console.log("[Location] Search pipeline encountered error:", error);
      return [];
    }
  }
};
