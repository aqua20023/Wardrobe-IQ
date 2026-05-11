import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts, radii, spacing } from "../../theme/editorial";
import { EditorialText } from "./EditorialText";
import { PressableScale } from "./PressableScale";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

const variants = StyleSheet.create({
  primary: {
    backgroundColor: colors.ivory,
    borderColor: colors.ivory
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: colors.silverSoft
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  danger: {
    backgroundColor: colors.oxblood,
    borderColor: colors.oxblood
  }
});

const textColors = {
  primary: colors.black,
  secondary: colors.ivory,
  ghost: colors.silver,
  danger: colors.ivory
};

export function Button({ label, onPress, variant = "primary", disabled, loading, icon, style }: ButtonProps) {
  const foreground = textColors[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.button, variants[variant], style]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={foreground} /> : null}
        {!loading && icon ? <Ionicons name={icon} size={18} color={foreground} /> : null}
        <EditorialText variant="label" uppercase style={[styles.label, { color: foreground }]}>
          {label}
        </EditorialText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.xl
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  label: {
    fontFamily: fonts.sans,
    textAlign: "center"
  }
});
