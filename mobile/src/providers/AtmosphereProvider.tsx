import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useWeatherStore } from "../stores/weatherStore";
import { 
  timeThemes, 
  type TimeOfDay, 
  type AtmosphereTheme, 
  type WeatherOverride,
  weatherAtmospheres 
} from "../theme/environmentThemes";

type AtmosphereContextType = {
  timeOfDay: TimeOfDay;
  theme: AtmosphereTheme;
  weatherOverride?: WeatherOverride;
};

const AtmosphereContext = createContext<AtmosphereContextType>({
  timeOfDay: "afternoon",
  theme: timeThemes.afternoon,
});

function calculateTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export const AtmosphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(calculateTimeOfDay());
  const currentWeather = useWeatherStore((state) => state.currentWeather);

  useEffect(() => {
    // Refresh time of day check occasionally
    const timer = setInterval(() => {
      setTimeOfDay(calculateTimeOfDay());
    }, 1000 * 60 * 15); // Every 15 mins
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => {
    const baseTheme = timeThemes[timeOfDay];
    const weatherType = currentWeather?.type;
    const override = weatherType ? weatherAtmospheres[weatherType] : undefined;

    return {
      timeOfDay,
      theme: baseTheme,
      weatherOverride: override
    };
  }, [timeOfDay, currentWeather]);

  return (
    <AtmosphereContext.Provider value={value}>
      {children}
    </AtmosphereContext.Provider>
  );
};

export const useAtmosphere = () => useContext(AtmosphereContext);
