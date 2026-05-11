import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { locationApi, type GeoLocation } from "../api/location";
import { weatherApi, type WeatherData } from "../api/weather";

type WeatherState = {
  currentWeather: WeatherData | null;
  location: GeoLocation | null;
  isGpsEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  refresh: (force?: boolean) => Promise<void>;
  setManualLocation: (location: GeoLocation) => Promise<void>;
  useGps: () => Promise<void>;
};

const DEFAULT_LOCATION: GeoLocation = {
  latitude: 51.5074,
  longitude: -0.1278,
  city: "London",
  country: "United Kingdom"
};

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      currentWeather: null,
      location: DEFAULT_LOCATION, // Pre-populate state with a stylish fallback
      isGpsEnabled: true,
      isLoading: false,
      error: null,
      lastFetched: null,

      refresh: async (force = false) => {
        const { lastFetched, isLoading, location, isGpsEnabled } = get();
        
        // Cache strategy: 15 minutes
        if (!force && lastFetched && Date.now() - lastFetched < 15 * 60 * 1000 && get().currentWeather) {
          return;
        }

        if (isLoading) return;
        set({ isLoading: true, error: null });

        try {
          let activeLocation = location || DEFAULT_LOCATION;
          
          if (isGpsEnabled) {
            try {
              activeLocation = await locationApi.getCurrentLocation();
              set({ location: activeLocation });
            } catch (err) {
              console.warn("[WeatherStore] GPS unavailable, using fallback:", activeLocation.city);
              // Don't overwrite location state with fallback if we already have one set,
              // but rely on activeLocation holding either previous or DEFAULT_LOCATION
            }
          }

          const weather = await weatherApi.getWeather(activeLocation.latitude, activeLocation.longitude);
          
          set({
            currentWeather: weather,
            lastFetched: Date.now(),
            isLoading: false
          });
        } catch (err: any) {
          console.error("[WeatherStore] Fetch error:", err);
          set({
            isLoading: false,
            error: "Check your connection. Pulling last available data."
          });
        }
      },

      setManualLocation: async (location: GeoLocation) => {
        set({ location, isGpsEnabled: false, lastFetched: null });
        // Immediately trigger fetch
        const { refresh } = get();
        await refresh(true);
      },

      useGps: async () => {
        set({ isGpsEnabled: true, lastFetched: null });
        const { refresh } = get();
        await refresh(true);
      }
    }),
    {
      name: "wardrobe-weather-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentWeather: state.currentWeather,
        location: state.location,
        isGpsEnabled: state.isGpsEnabled,
        lastFetched: state.lastFetched
      })
    }
  )
);
