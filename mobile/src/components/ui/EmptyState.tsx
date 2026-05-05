import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Button } from "./Button";

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = "shirt-outline", title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-lg border border-graphite bg-charcoal px-6 py-10">
      <Ionicons name={icon} size={32} color="#e7e4dc" />
      <Text className="mt-4 text-center text-lg font-semibold text-mist">{title}</Text>
      {body ? <Text className="mt-2 text-center text-sm leading-5 text-stone">{body}</Text> : null}
      {actionLabel && onAction ? (
        <View className="mt-5 w-full">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
