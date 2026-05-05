export type WardrobeCategory =
  | "tops"
  | "bottoms"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "dresses"
  | "activewear"
  | "other";

export type Occasion =
  | "casual"
  | "formal"
  | "work"
  | "party"
  | "travel"
  | "workout"
  | "date"
  | "other";

export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";

export interface WardrobeItemDTO {
  id: string;
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
}

export interface OutfitDTO {
  id: string;
  title: string;
  itemIds: string[];
  occasion?: Occasion;
  notes?: string;
  liked: boolean;
  saved: boolean;
  wornCount: number;
  createdAt: string;
}
