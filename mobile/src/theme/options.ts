import type { Occasion, Season, WardrobeCategory } from "../types/domain";

export const categories: WardrobeCategory[] = ["tops", "bottoms", "outerwear", "shoes", "accessories", "dresses", "activewear", "other"];
export const occasions: Occasion[] = ["casual", "formal", "work", "party", "travel", "workout", "date", "other"];
export const seasons: Season[] = ["all-season", "spring", "summer", "fall", "winter"];

export const categoryLabels: Record<WardrobeCategory, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Footwear",
  accessories: "Accessories",
  dresses: "Dresses",
  activewear: "Activewear",
  other: "Other"
};
