import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View className="flex-1 rounded-lg border border-graphite bg-charcoal p-4">
      <Ionicons name={icon} size={18} color="#b59b68" />
      <Text className="mt-3 text-2xl font-semibold text-mist">{value}</Text>
      <Text className="mt-1 text-xs uppercase text-stone">{label}</Text>
    </View>
  );
}
