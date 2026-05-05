import { View } from "react-native";

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} className="h-24 rounded-lg bg-charcoal opacity-80" />
      ))}
    </View>
  );
}
