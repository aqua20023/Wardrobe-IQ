export type WardrobeCategory =
  | "tops"
  | "bottoms"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "dresses"
  | "activewear"
  | "other";

export type Occasion = "casual" | "formal" | "work" | "party" | "travel" | "workout" | "date" | "other";
export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    preferredColors?: string[];
    preferredOccasions?: string[];
    climate?: string;
    notificationsEnabled?: boolean;
    sizeProfile?: {
      top?: string;
      bottom?: string;
      shoe?: string;
    };
  };
  styleProfile?: {
    styleKeywords?: string[];
    avoidKeywords?: string[];
    favoriteBrands?: string[];
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type ClothingItem = {
  id: string;
  _id?: string;
  imageUrl: string;
  category: WardrobeCategory;
  subcategory?: string;
  color?: string;
  tags: string[];
  occasion: Occasion[];
  season: Season[];
  notes?: string;
  usageCount: number;
  lastWorn?: string;
  createdAt: string;
  aiMetadata?: {
    predictedCategory: string;
    finalCategory: string;
    confidence: number;
    userCorrected: boolean;
  };
};

export type AiPrediction = {
  imageUrl: string;
  imagePublicId: string;
  predictedCategory: WardrobeCategory | "unknown";
  confidence: number;
};

export type Outfit = {
  id: string;
  _id?: string;
  title: string;
  itemIds: Array<string | ClothingItem>;
  occasion: Occasion;
  notes?: string;
  liked: boolean;
  saved: boolean;
  wornCount: number;
  createdAt: string;
};

export type OutfitSuggestion = {
  id: string;
  title: string;
  occasion: Occasion;
  weather: string;
  items: ClothingItem[];
  saved: boolean;
  liked: boolean;
  confidence: number;
  reason: string;
};

export type PaginatedWardrobe = {
  items: ClothingItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type PaginatedOutfits = {
  outfits: Outfit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};
