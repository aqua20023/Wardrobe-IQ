import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  AddItem: undefined;
  ClothingDetail: { itemId: string };
  OutfitBuilder: { initialItemId?: string };
  OutfitDetail: {
    title: string;
    occasion?: string;
    weather?: string;
    confidence?: number;
    reason?: string;
    imageUrls?: string[];
    itemLabels?: string[];
  };
  Analytics: undefined;
  AiSearch: undefined;
  PremiumRecommendations: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  AIScan: undefined;
  Outfits: undefined;
  Assistant: undefined;
};
