import { Pressable, Text } from "react-native";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 mt-2 rounded-full border px-4 py-2 ${
        selected ? "border-mist bg-mist" : "border-graphite bg-charcoal"
      }`}
    >
      <Text className={`text-sm font-medium ${selected ? "text-ink" : "text-stone"}`}>{label}</Text>
    </Pressable>
  );
}
