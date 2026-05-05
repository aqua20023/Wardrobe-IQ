import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

const variants = {
  primary: "bg-mist",
  secondary: "bg-charcoal border border-graphite",
  ghost: "bg-transparent",
  danger: "bg-oxblood"
};

const textVariants = {
  primary: "text-ink",
  secondary: "text-mist",
  ghost: "text-stone",
  danger: "text-white"
};

export function Button({ label, onPress, variant = "primary", disabled, loading, icon }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-[52px] min-h-[52px] items-center justify-center rounded-lg px-5 ${variants[variant]} ${
        disabled || loading ? "opacity-50" : "opacity-100"
      }`}
    >
      <View className="flex-row items-center gap-2">
        {loading ? <ActivityIndicator color={variant === "primary" ? "#0b0b0c" : "#f4f4f1"} /> : null}
        {!loading && icon ? <Ionicons name={icon} size={18} color={variant === "primary" ? "#0b0b0c" : "#f4f4f1"} /> : null}
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>{label}</Text>
      </View>
    </Pressable>
  );
}
