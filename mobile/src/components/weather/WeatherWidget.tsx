import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { useWeatherStore } from "../../stores/weatherStore";
import { EditorialText } from "../ui/EditorialText";
import { colors, spacing } from "../../theme/editorial";
import { type WeatherCondition } from "../../api/weather";
import { LocationPickerModal } from "./LocationModal";

export function WeatherWidget() {
  const { currentWeather, location, isLoading, refresh, error } = useWeatherStore();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const handlePress = () => {
    setModalVisible(true);
  };

  if (isLoading && !currentWeather) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.gold} style={{ marginRight: 8 }} />
        <EditorialText variant="label" tone="dim" uppercase>Retrieving Weather...</EditorialText>
      </View>
    );
  }

  const cityName = location?.city || "Unknown";
  const temp = currentWeather ? `${currentWeather.temperature}°C` : "--°C";
  const conditionText = currentWeather?.conditionText || (error ? "Unavailable" : "Syncing");

  return (
    <>
      <Pressable onPress={handlePress} style={styles.container} accessibilityRole="button">
        <View style={styles.iconWrap}>
          <AnimatedWeatherIcon type={currentWeather?.type} />
        </View>
        <EditorialText variant="label" tone="gold" uppercase style={styles.text}>
          {cityName} • {temp} • {conditionText}
        </EditorialText>
        <Ionicons name="chevron-down" size={12} color={colors.gold} style={{ marginLeft: 4 }} />
      </Pressable>

      <LocationPickerModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

function AnimatedWeatherIcon({ type }: { type?: WeatherCondition }) {
  const rotate = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    if (type === "sunny") {
      rotate.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      float.value = withRepeat(
        withTiming(2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [type]);

  const style = useAnimatedStyle(() => {
    if (type === "sunny") {
      return { transform: [{ rotate: `${rotate.value}deg` }] };
    }
    return { transform: [{ translateY: float.value }] };
  });

  const getIconParams = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type) {
      case "sunny": return { name: "sunny-outline", color: colors.gold };
      case "cloudy": return { name: "cloud-outline", color: colors.silverSoft };
      case "rainy": return { name: "rainy-outline", color: colors.silverSoft };
      case "snowy": return { name: "snow-outline", color: colors.ivory };
      case "stormy": return { name: "thunderstorm-outline", color: colors.gold };
      case "misty": return { name: "reorder-two-outline", color: colors.dim };
      default: return { name: "partly-sunny-outline", color: colors.dim };
    }
  };

  const { name, color } = getIconParams();

  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={16} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  iconWrap: {
    marginRight: 8,
    width: 18,
    alignItems: "center"
  },
  text: {
    letterSpacing: 1.2
  }
});
