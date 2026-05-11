import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SplashScreen } from "../features/onboarding/screens/SplashScreen";
import { OnboardingScreen } from "../features/onboarding/screens/OnboardingScreen";
import { LoginScreen } from "../features/auth/screens/LoginScreen";
import { SignupScreen } from "../features/auth/screens/SignupScreen";
import { ForgotPasswordScreen } from "../features/auth/screens/ForgotPasswordScreen";
import { HomeScreen } from "../features/home/screens/HomeScreen";
import { WardrobeScreen } from "../features/wardrobe/screens/WardrobeScreen";
import { AddItemScreen } from "../features/wardrobe/screens/AddItemScreen";
import { ClothingDetailScreen } from "../features/wardrobe/screens/ClothingDetailScreen";
import { OutfitBuilderScreen } from "../features/outfits/screens/OutfitBuilderScreen";
import { OutfitSuggestionsScreen } from "../features/outfits/screens/OutfitSuggestionsScreen";
import { OutfitDetailScreen } from "../features/outfits/screens/OutfitDetailScreen";
import { ChatScreen } from "../features/chat/screens/ChatScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { AnalyticsScreen } from "../features/analytics/screens/AnalyticsScreen";
import { AiSearchScreen } from "../features/search/screens/AiSearchScreen";
import { PremiumRecommendationsScreen } from "../features/recommendations/screens/PremiumRecommendationsScreen";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { useAuthStore } from "../stores/authStore";
import { colors, fonts, navThemeColors } from "../theme/editorial";
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...navThemeColors
  }
};

function AuthNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Signup" component={SignupScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.silverSoft,
        tabBarLabel: ({ color, focused }) => (
          <Text style={[styles.tabLabel, { color }, focused ? styles.tabLabelActive : null]}>
            {route.name === "AIScan" ? "AI SCAN" : route.name.toUpperCase()}
          </Text>
        ),
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: "home-outline",
            Wardrobe: "file-tray-full-outline",
            AIScan: "scan-outline",
            Outfits: "accessibility-outline",
            Assistant: "chatbubbles-outline"
          };
          return (
            <View style={[styles.tabIconWrap, focused ? styles.tabIconActive : null]}>
              <Ionicons name={icons[route.name]} color={color} size={23} />
            </View>
          );
        }
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tabs.Screen name="AIScan" component={AddItemScreen} />
      <Tabs.Screen name="Outfits" component={OutfitSuggestionsScreen} />
      <Tabs.Screen name="Assistant" component={ChatScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.black },
          headerTintColor: colors.ivory,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: fonts.serif, fontSize: 21 },
          contentStyle: { backgroundColor: colors.black }
        }}
      >
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="AddItem" component={AddItemScreen} options={{ title: "AI Scan" }} />
        <RootStack.Screen name="ClothingDetail" component={ClothingDetailScreen} options={{ title: "Archive Detail" }} />
        <RootStack.Screen name="OutfitBuilder" component={OutfitBuilderScreen} options={{ title: "Manual Curation" }} />
        <RootStack.Screen name="OutfitDetail" component={OutfitDetailScreen} options={{ title: "Stylist Notes" }} />
        <RootStack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "Wardrobe Metrics" }} />
        <RootStack.Screen name="AiSearch" component={AiSearchScreen} options={{ title: "AI Search" }} />
        <RootStack.Screen name="PremiumRecommendations" component={PremiumRecommendationsScreen} options={{ title: "Complete the Look" }} />
        <RootStack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
        <RootStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export function RootNavigator() {
  const { status, onboardingComplete, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === "idle" || status === "loading") return <SplashScreen />;
  if (!onboardingComplete) return <OnboardingScreen />;
  if (status !== "authenticated") return <AuthNavigator />;
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "rgba(13,13,12,0.96)",
    borderTopColor: colors.border,
    borderTopWidth: 1
  },
  tabLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    fontWeight: "800"
  },
  tabLabelActive: {
    letterSpacing: 1.8
  },
  tabIconWrap: {
    minWidth: 32,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIconActive: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gold
  }
});
