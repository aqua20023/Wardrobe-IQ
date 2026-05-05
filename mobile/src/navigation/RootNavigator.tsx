import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
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
import { FavoritesScreen } from "../features/outfits/screens/FavoritesScreen";
import { ChatScreen } from "../features/chat/screens/ChatScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { useAuthStore } from "../stores/authStore";
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0b0b0c",
    card: "#0b0b0c",
    text: "#f4f4f1",
    border: "#2a2a2d",
    primary: "#f4f4f1"
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
        tabBarStyle: { backgroundColor: "#0b0b0c", borderTopColor: "#2a2a2d", height: 74, paddingTop: 8 },
        tabBarActiveTintColor: "#f4f4f1",
        tabBarInactiveTintColor: "#8f8a82",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: "home-outline",
            Wardrobe: "shirt-outline",
            Suggestions: "sparkles-outline",
            Chat: "chatbubble-ellipses-outline",
            Favorites: "heart-outline",
            Profile: "person-outline"
          };
          return <Ionicons name={icons[route.name]} color={color} size={size} />;
        }
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tabs.Screen name="Suggestions" component={OutfitSuggestionsScreen} />
      <Tabs.Screen name="Chat" component={ChatScreen} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0b0b0c" },
          headerTintColor: "#f4f4f1",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#0b0b0c" }
        }}
      >
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="AddItem" component={AddItemScreen} options={{ title: "Add Item" }} />
        <RootStack.Screen name="ClothingDetail" component={ClothingDetailScreen} options={{ title: "Item Details" }} />
        <RootStack.Screen name="OutfitBuilder" component={OutfitBuilderScreen} options={{ title: "Outfit Builder" }} />
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
