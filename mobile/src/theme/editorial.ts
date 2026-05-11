import { Platform, StyleSheet } from "react-native";

export const colors = {
  black: "#0b0b0a",
  matte: "#10100f",
  ink: "#131313",
  charcoal: "#1a1a19",
  charcoalHigh: "#23221f",
  graphite: "#31302c",
  espresso: "#2a1c13",
  espressoSoft: "#3b2a1e",
  ivory: "#f5f2ed",
  ivoryMuted: "#d8d3c9",
  stone: "#aaa59c",
  dim: "#77736c",
  gold: "#e4bf72",
  goldSoft: "#cda765",
  silver: "#c8c6c1",
  silverSoft: "#8f918f",
  beige: "#b6a58a",
  oxblood: "#8f3345",
  success: "#9fb39b",
  border: "rgba(245, 242, 237, 0.12)",
  borderWarm: "rgba(228, 191, 114, 0.28)",
  glass: "rgba(26, 26, 25, 0.78)",
  veil: "rgba(0, 0, 0, 0.48)"
} as const;

export const fonts = {
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
  sans: Platform.select({ ios: "Avenir Next", android: "sans-serif", default: "system-ui" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" })
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  section: 44
} as const;

export const radii = {
  sm: 3,
  md: 5,
  lg: 8,
  xl: 12,
  round: 999
} as const;

export const shadows = StyleSheet.create({
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.44,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8
  },
  soft: {
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  }
});

export const navThemeColors = {
  background: colors.black,
  card: colors.black,
  text: colors.ivory,
  border: colors.border,
  primary: colors.gold,
  notification: colors.gold
};

