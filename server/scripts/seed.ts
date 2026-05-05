import { connectDatabase, disconnectDatabase } from "../src/config/database";
import { hashPassword } from "../src/common/utils/password";
import { FeedbackModel } from "../src/modules/feedback/feedback.model";
import { OutfitModel } from "../src/modules/outfits/outfit.model";
import { UserModel } from "../src/modules/users/user.model";
import { ClothingItemModel } from "../src/modules/wardrobe/clothingItem.model";

const demoItems = [
  {
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    category: "tops",
    subcategory: "White tee",
    color: "white",
    tags: ["cotton", "favorite", "minimal"],
    occasion: ["casual", "travel"],
    season: ["summer", "all-season"],
    usageCount: 4
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    category: "outerwear",
    subcategory: "Black blazer",
    color: "black",
    tags: ["formal", "work"],
    occasion: ["work", "formal"],
    season: ["fall", "winter", "all-season"],
    usageCount: 2
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    category: "bottoms",
    subcategory: "Straight denim",
    color: "blue",
    tags: ["denim", "casual"],
    occasion: ["casual", "travel"],
    season: ["all-season"],
    usageCount: 6
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    category: "shoes",
    subcategory: "Leather sneakers",
    color: "white",
    tags: ["comfortable", "favorite"],
    occasion: ["casual", "travel"],
    season: ["all-season"],
    usageCount: 8
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    category: "accessories",
    subcategory: "Structured bag",
    color: "black",
    tags: ["work", "minimal"],
    occasion: ["work", "formal"],
    season: ["all-season"],
    usageCount: 3
  }
] as const;

async function seed() {
  await connectDatabase();

  const existing = await UserModel.findOne({ email: "demo@wardrobeiq.app" });
  if (existing) {
    await Promise.all([
      ClothingItemModel.deleteMany({ userId: existing._id }),
      OutfitModel.deleteMany({ userId: existing._id }),
      FeedbackModel.deleteMany({ userId: existing._id }),
      UserModel.deleteOne({ _id: existing._id })
    ]);
  }

  const user = await UserModel.create({
    name: "Demo Stylist",
    email: "demo@wardrobeiq.app",
    password: await hashPassword("Password123!"),
    preferences: {
      preferredColors: ["black", "white", "blue"],
      preferredOccasions: ["casual", "work"],
      climate: "mixed",
      notificationsEnabled: true
    },
    styleProfile: {
      styleKeywords: ["minimal", "tailored", "clean"],
      avoidKeywords: ["loud prints"],
      favoriteBrands: ["Everlane", "Uniqlo"]
    }
  });

  const items = await ClothingItemModel.insertMany(demoItems.map((item) => ({ ...item, userId: user._id })));

  const outfit = await OutfitModel.create({
    userId: user._id,
    title: "Clean weekday uniform",
    itemIds: items.slice(0, 4).map((item) => item._id),
    occasion: "work",
    notes: "A reliable monochrome base with denim and clean sneakers.",
    liked: true,
    saved: true,
    wornCount: 1
  });

  await FeedbackModel.create({
    userId: user._id,
    outfitId: outfit._id,
    action: "save"
  });

  console.log("Seed complete");
  console.log("Email: demo@wardrobeiq.app");
  console.log("Password: Password123!");

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
