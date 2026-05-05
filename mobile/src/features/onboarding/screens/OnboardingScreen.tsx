import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "../../../components/ui/Button";
import { Screen } from "../../../components/ui/Screen";
import { useAuthStore } from "../../../stores/authStore";

const slides = [
  {
    title: "See your wardrobe clearly",
    body: "Capture items, organize details, and keep your closet searchable from your phone."
  },
  {
    title: "Build outfits faster",
    body: "Select pieces manually, save reliable combinations, and mark what you actually wear."
  },
  {
    title: "Ready for smarter styling",
    body: "The MVP stores the clean signals future recommendations and NLP prompts will need."
  }
];

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const slide = slides[index];
  const last = index === slides.length - 1;

  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-between py-8">
        <View>
          <Text className="text-sm uppercase text-brass">Wardrobe IQ</Text>
          <Text className="mt-8 text-5xl font-semibold leading-tight text-mist">{slide.title}</Text>
          <Text className="mt-5 text-lg leading-7 text-stone">{slide.body}</Text>
        </View>

        <View>
          <View className="mb-8 flex-row gap-2">
            {slides.map((_, dotIndex) => (
              <View key={dotIndex} className={`h-1.5 flex-1 rounded-full ${dotIndex === index ? "bg-mist" : "bg-graphite"}`} />
            ))}
          </View>
          <Button label={last ? "Get Started" : "Next"} icon="arrow-forward" onPress={() => (last ? completeOnboarding() : setIndex(index + 1))} />
          {!last ? (
            <View className="mt-3">
              <Button label="Skip" variant="ghost" onPress={completeOnboarding} />
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
