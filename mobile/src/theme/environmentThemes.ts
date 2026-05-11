export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type AtmosphereTheme = {
  gradient: readonly [string, string, ...string[]];
  ambientColor: string;
  particleColor: string;
  ambientOpacity: number;
  glowColor?: string;
  effectSpeed: number;
};

export const timeThemes: Record<TimeOfDay, AtmosphereTheme> = {
  morning: {
    gradient: ["rgba(143, 145, 143, 0.08)", "rgba(245, 242, 237, 0.02)", "transparent"],
    ambientColor: "#e0e6ed", // subtle cool blue-silver
    particleColor: "rgba(200, 198, 193, 0.4)",
    ambientOpacity: 0.06,
    effectSpeed: 30000,
  },
  afternoon: {
    gradient: ["transparent", "transparent"],
    ambientColor: "transparent",
    particleColor: "rgba(245, 242, 237, 0.1)",
    ambientOpacity: 0,
    effectSpeed: 0,
  },
  evening: {
    gradient: ["rgba(205, 167, 101, 0.04)", "rgba(42, 28, 19, 0.08)", "transparent"],
    ambientColor: "#cda765", // soft amber
    glowColor: "#e4bf72",
    particleColor: "rgba(228, 191, 114, 0.2)",
    ambientOpacity: 0.08,
    effectSpeed: 20000,
  },
  night: {
    gradient: ["rgba(16, 16, 15, 0.2)", "transparent", "rgba(11, 11, 10, 0.4)"],
    ambientColor: "#131313",
    particleColor: "rgba(255, 255, 255, 0.08)",
    ambientOpacity: 0.25,
    effectSpeed: 25000,
  },
};

export type WeatherOverride = {
  ambientColor?: string;
  extraOpacity?: number;
  particleScale?: number;
  tint?: string;
};

export const weatherAtmospheres: Record<string, WeatherOverride> = {
  sunny: {
    ambientColor: "#e4bf72",
    tint: "rgba(228, 191, 114, 0.03)",
    extraOpacity: 0.04,
  },
  rainy: {
    ambientColor: "#8f918f",
    tint: "rgba(119, 115, 108, 0.08)",
    extraOpacity: 0.15,
    particleScale: 1.2,
  },
  snowy: {
    ambientColor: "#f5f2ed",
    tint: "rgba(200, 198, 193, 0.05)",
    extraOpacity: 0.1,
  },
  misty: {
    tint: "rgba(121, 121, 121, 0.1)",
    extraOpacity: 0.2,
  },
  stormy: {
    ambientColor: "#31302c",
    tint: "rgba(0, 0, 0, 0.15)",
    extraOpacity: 0.25,
  }
};
