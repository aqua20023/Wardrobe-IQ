import type React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { colors, fonts } from "../../theme/editorial";

type Variant =
  | "brand"
  | "hero"
  | "headline"
  | "headlineSmall"
  | "title"
  | "subtitle"
  | "body"
  | "bodySmall"
  | "label"
  | "caption"
  | "mono";

type Tone = keyof typeof colors;

type EditorialTextProps = TextProps & {
  children: React.ReactNode;
  variant?: Variant;
  tone?: Tone;
  uppercase?: boolean;
};

const variants: Record<Variant, TextStyle> = {
  brand: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 4,
    fontWeight: "700"
  },
  hero: {
    fontFamily: fonts.serif,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: "700"
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: 0,
    fontWeight: "600"
  },
  headlineSmall: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: 0,
    fontWeight: "600"
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.8,
    fontWeight: "700"
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: 0,
    fontWeight: "600"
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
    fontWeight: "400"
  },
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
    fontWeight: "400"
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 2,
    fontWeight: "800"
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.4,
    fontWeight: "600"
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1,
    fontWeight: "600"
  }
};

export function EditorialText({
  children,
  variant = "body",
  tone = "ivory",
  uppercase,
  style,
  ...props
}: EditorialTextProps) {
  return (
    <Text style={[variants[variant], { color: colors[tone] }, uppercase ? { textTransform: "uppercase" } : null, style]} {...props}>
      {children}
    </Text>
  );
}

