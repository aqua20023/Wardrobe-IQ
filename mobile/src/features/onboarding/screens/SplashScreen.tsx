import { Text, View } from "react-native";
import { Screen } from "../../../components/ui/Screen";

export function SplashScreen() {
  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-center">
        <View className="h-20 w-20 items-center justify-center rounded-2xl border border-stone bg-mist">
          <Text className="text-3xl font-black text-ink">WIQ</Text>
        </View>
        <Text className="mt-6 text-3xl font-semibold text-mist">Wardrobe IQ</Text>
        <Text className="mt-2 text-sm uppercase text-stone">Your closet, organized</Text>
      </View>
    </Screen>
  );
}
