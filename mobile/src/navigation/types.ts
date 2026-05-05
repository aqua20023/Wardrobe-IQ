export type RootStackParamList = {
  MainTabs: undefined;
  AddItem: undefined;
  ClothingDetail: { itemId: string };
  OutfitBuilder: { initialItemId?: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Suggestions: undefined;
  Chat: undefined;
  Favorites: undefined;
  Profile: undefined;
};
