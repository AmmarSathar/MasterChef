export interface FoodItem {
  name: string;
  category: FoodCategory;
  tags: FoodTag[];
  contains?: string[];
}

export type FoodCategory =
  | "Nuts & Seeds"
  | "Dairy & Eggs"
  | "Meat & Poultry"
  | "Seafood"
  | "Fruits"
  | "Vegetables"
  | "Legumes"
  | "Grains & Cereals"
  | "Spices & Herbs"
  | "Condiments & Sauces"
  | "Oils & Fats"
  | "Sweeteners"
  | "Beverages"
  | "Baked Goods"
  | "Compounds";

export type FoodTag =
  | "meat"
  | "poultry"
  | "pork"
  | "seafood"
  | "fish"
  | "shellfish"
  | "dairy"
  | "eggs"
  | "animal-product"
  | "gelatin"
  | "alcohol"
  | "grain"
  | "gluten"
  | "legume"
  | "high-carb"
  | "processed"
  | "plant-based";

export const foods: FoodItem[] = [
  // ── Nuts & Seeds ──────────────────────────────────────────
  { name: "Peanuts", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Almonds", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Cashews", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Walnuts", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Pecans", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Pistachios", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Hazelnuts", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Macadamia Nuts", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Brazil Nuts", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Pine Nuts", category: "Nuts & Seeds", tags: ["plant-based"], contains: ["Tree Nuts"] },
  { name: "Coconut", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Sesame", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Sunflower Seeds", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Poppy Seeds", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Flaxseed", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Chia Seeds", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Hemp Seeds", category: "Nuts & Seeds", tags: ["plant-based"] },
  { name: "Pumpkin Seeds", category: "Nuts & Seeds", tags: ["plant-based"] },

  // ── Dairy & Eggs ──────────────────────────────────────────
  { name: "Milk", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein", "Whey"] },
  { name: "Eggs", category: "Dairy & Eggs", tags: ["eggs", "animal-product"] },
  { name: "Cheese", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein", "Whey"] },
  { name: "Butter", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein"] },
  { name: "Cream", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein", "Whey"] },
  { name: "Yogurt", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein", "Whey"] },
  { name: "Sour Cream", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein"] },
  { name: "Cream Cheese", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein"] },
  { name: "Whipped Cream", category: "Dairy & Eggs", tags: ["dairy", "animal-product"], contains: ["Lactose", "Casein"] },
  { name: "Ice Cream", category: "Dairy & Eggs", tags: ["dairy", "animal-product", "high-carb"], contains: ["Lactose", "Casein", "Whey"] },

  // ── Meat & Poultry ────────────────────────────────────────
  { name: "Chicken", category: "Meat & Poultry", tags: ["meat", "poultry"] },
  { name: "Beef", category: "Meat & Poultry", tags: ["meat"] },
  { name: "Pork", category: "Meat & Poultry", tags: ["meat", "pork"] },
  { name: "Turkey", category: "Meat & Poultry", tags: ["meat", "poultry"] },
  { name: "Lamb", category: "Meat & Poultry", tags: ["meat"] },
  { name: "Duck", category: "Meat & Poultry", tags: ["meat", "poultry"] },
  { name: "Bacon", category: "Meat & Poultry", tags: ["meat", "pork", "processed"], contains: ["Nitrates"] },
  { name: "Sausage", category: "Meat & Poultry", tags: ["meat", "processed"], contains: ["Nitrates", "Sulfites"] },
  { name: "Ham", category: "Meat & Poultry", tags: ["meat", "pork", "processed"], contains: ["Nitrates"] },
  { name: "Ground Beef", category: "Meat & Poultry", tags: ["meat"] },

  // ── Seafood ───────────────────────────────────────────────
  { name: "Salmon", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Tuna", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Cod", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Tilapia", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Sardines", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Anchovies", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Trout", category: "Seafood", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Shrimp", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Crab", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Lobster", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Scallops", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Mussels", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Clams", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Oysters", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Squid", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Octopus", category: "Seafood", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },

  // ── Fruits ────────────────────────────────────────────────
  { name: "Apple", category: "Fruits", tags: ["plant-based"] },
  { name: "Banana", category: "Fruits", tags: ["plant-based", "high-carb"] },
  { name: "Orange", category: "Fruits", tags: ["plant-based"] },
  { name: "Lemon", category: "Fruits", tags: ["plant-based"] },
  { name: "Lime", category: "Fruits", tags: ["plant-based"] },
  { name: "Grapefruit", category: "Fruits", tags: ["plant-based"] },
  { name: "Strawberry", category: "Fruits", tags: ["plant-based"] },
  { name: "Blueberry", category: "Fruits", tags: ["plant-based"] },
  { name: "Raspberry", category: "Fruits", tags: ["plant-based"] },
  { name: "Blackberry", category: "Fruits", tags: ["plant-based"] },
  { name: "Cranberry", category: "Fruits", tags: ["plant-based"] },
  { name: "Cherry", category: "Fruits", tags: ["plant-based"] },
  { name: "Grape", category: "Fruits", tags: ["plant-based"] },
  { name: "Pineapple", category: "Fruits", tags: ["plant-based"] },
  { name: "Mango", category: "Fruits", tags: ["plant-based", "high-carb"] },
  { name: "Papaya", category: "Fruits", tags: ["plant-based"] },
  { name: "Kiwi", category: "Fruits", tags: ["plant-based"] },
  { name: "Peach", category: "Fruits", tags: ["plant-based"] },
  { name: "Pear", category: "Fruits", tags: ["plant-based"] },
  { name: "Plum", category: "Fruits", tags: ["plant-based"] },
  { name: "Watermelon", category: "Fruits", tags: ["plant-based"] },
  { name: "Cantaloupe", category: "Fruits", tags: ["plant-based"] },
  { name: "Avocado", category: "Fruits", tags: ["plant-based"] },
  { name: "Pomegranate", category: "Fruits", tags: ["plant-based"] },
  { name: "Fig", category: "Fruits", tags: ["plant-based"] },
  { name: "Date", category: "Fruits", tags: ["plant-based", "high-carb"] },
  { name: "Passion Fruit", category: "Fruits", tags: ["plant-based"] },
  { name: "Guava", category: "Fruits", tags: ["plant-based"] },
  { name: "Lychee", category: "Fruits", tags: ["plant-based"] },
  { name: "Dragon Fruit", category: "Fruits", tags: ["plant-based"] },
  { name: "Tomato", category: "Fruits", tags: ["plant-based"] },

  // ── Vegetables ────────────────────────────────────────────
  { name: "Carrot", category: "Vegetables", tags: ["plant-based"] },
  { name: "Celery", category: "Vegetables", tags: ["plant-based"] },
  { name: "Onion", category: "Vegetables", tags: ["plant-based"] },
  { name: "Garlic", category: "Vegetables", tags: ["plant-based"] },
  { name: "Bell Pepper", category: "Vegetables", tags: ["plant-based"] },
  { name: "Potato", category: "Vegetables", tags: ["plant-based", "high-carb"] },
  { name: "Sweet Potato", category: "Vegetables", tags: ["plant-based", "high-carb"] },
  { name: "Corn", category: "Vegetables", tags: ["plant-based", "high-carb"] },
  { name: "Broccoli", category: "Vegetables", tags: ["plant-based"] },
  { name: "Cauliflower", category: "Vegetables", tags: ["plant-based"] },
  { name: "Spinach", category: "Vegetables", tags: ["plant-based"] },
  { name: "Kale", category: "Vegetables", tags: ["plant-based"] },
  { name: "Lettuce", category: "Vegetables", tags: ["plant-based"] },
  { name: "Cabbage", category: "Vegetables", tags: ["plant-based"] },
  { name: "Brussels Sprouts", category: "Vegetables", tags: ["plant-based"] },
  { name: "Zucchini", category: "Vegetables", tags: ["plant-based"] },
  { name: "Cucumber", category: "Vegetables", tags: ["plant-based"] },
  { name: "Eggplant", category: "Vegetables", tags: ["plant-based"] },
  { name: "Mushroom", category: "Vegetables", tags: ["plant-based"] },
  { name: "Asparagus", category: "Vegetables", tags: ["plant-based"] },
  { name: "Green Beans", category: "Vegetables", tags: ["plant-based"] },
  { name: "Peas", category: "Vegetables", tags: ["plant-based"] },
  { name: "Artichoke", category: "Vegetables", tags: ["plant-based"] },
  { name: "Beet", category: "Vegetables", tags: ["plant-based"] },
  { name: "Radish", category: "Vegetables", tags: ["plant-based"] },
  { name: "Turnip", category: "Vegetables", tags: ["plant-based"] },
  { name: "Leek", category: "Vegetables", tags: ["plant-based"] },
  { name: "Ginger Root", category: "Vegetables", tags: ["plant-based"] },
  { name: "Jalapeño", category: "Vegetables", tags: ["plant-based"] },
  { name: "Habanero", category: "Vegetables", tags: ["plant-based"] },

  // ── Legumes ───────────────────────────────────────────────
  { name: "Lentils", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Chickpeas", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Black Beans", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Kidney Beans", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Lima Beans", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Navy Beans", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Pinto Beans", category: "Legumes", tags: ["plant-based", "legume", "high-carb"] },
  { name: "Green Peas", category: "Legumes", tags: ["plant-based", "legume"] },
  { name: "Edamame", category: "Legumes", tags: ["plant-based", "legume"], contains: ["Soy"] },
  { name: "Tofu", category: "Legumes", tags: ["plant-based", "legume"], contains: ["Soy"] },
  { name: "Tempeh", category: "Legumes", tags: ["plant-based", "legume"], contains: ["Soy"] },
  { name: "Lupin", category: "Legumes", tags: ["plant-based", "legume"] },

  // ── Grains & Cereals ──────────────────────────────────────
  { name: "Wheat", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten"] },
  { name: "Rice", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Oats", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten"] },
  { name: "Barley", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten"] },
  { name: "Rye", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten"] },
  { name: "Quinoa", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Buckwheat", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Couscous", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten", "Wheat"] },
  { name: "Bulgur", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten", "Wheat"] },
  { name: "Cornmeal", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Polenta", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Millet", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Amaranth", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Sorghum", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Bread", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten", "Wheat"] },
  { name: "Pasta", category: "Grains & Cereals", tags: ["grain", "gluten", "high-carb"], contains: ["Gluten", "Wheat", "Eggs"] },
  { name: "Flour", category: "Grains & Cereals", tags: ["plant-based", "grain", "gluten", "high-carb"], contains: ["Gluten", "Wheat"] },
  { name: "Tortilla", category: "Grains & Cereals", tags: ["plant-based", "grain", "high-carb"] },
  { name: "Noodles", category: "Grains & Cereals", tags: ["grain", "gluten", "high-carb"], contains: ["Gluten", "Wheat"] },

  // ── Spices & Herbs ────────────────────────────────────────
  { name: "Cinnamon", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Nutmeg", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Clove", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Cumin", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Coriander", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Turmeric", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Paprika", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Black Pepper", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Chili Pepper", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Cayenne", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Oregano", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Basil", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Thyme", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Rosemary", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Parsley", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Cilantro", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Dill", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Mint", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Bay Leaf", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Saffron", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Vanilla", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Cardamom", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Star Anise", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Fennel", category: "Spices & Herbs", tags: ["plant-based"] },
  { name: "Mustard", category: "Spices & Herbs", tags: ["plant-based"] },

  // ── Condiments & Sauces ───────────────────────────────────
  { name: "Soy Sauce", category: "Condiments & Sauces", tags: ["plant-based", "gluten"], contains: ["Soy", "Wheat", "Gluten"] },
  { name: "Fish Sauce", category: "Condiments & Sauces", tags: ["seafood", "fish"], contains: ["Fish"] },
  { name: "Oyster Sauce", category: "Condiments & Sauces", tags: ["seafood", "shellfish"], contains: ["Shellfish"] },
  { name: "Worcestershire Sauce", category: "Condiments & Sauces", tags: ["seafood", "fish"], contains: ["Fish", "Soy"] },
  { name: "Ketchup", category: "Condiments & Sauces", tags: ["plant-based"] },
  { name: "Mayonnaise", category: "Condiments & Sauces", tags: ["eggs"], contains: ["Eggs"] },
  { name: "Mustard Sauce", category: "Condiments & Sauces", tags: ["plant-based"], contains: ["Mustard"] },
  { name: "Vinegar", category: "Condiments & Sauces", tags: ["plant-based"], contains: ["Sulfites"] },
  { name: "Hot Sauce", category: "Condiments & Sauces", tags: ["plant-based"] },
  { name: "BBQ Sauce", category: "Condiments & Sauces", tags: ["plant-based", "processed"] },
  { name: "Tahini", category: "Condiments & Sauces", tags: ["plant-based"], contains: ["Sesame"] },
  { name: "Pesto", category: "Condiments & Sauces", tags: ["dairy"], contains: ["Tree Nuts", "Casein"] },
  { name: "Hummus", category: "Condiments & Sauces", tags: ["plant-based", "legume"], contains: ["Sesame", "Chickpeas"] },
  { name: "Miso", category: "Condiments & Sauces", tags: ["plant-based"], contains: ["Soy"] },
  { name: "Teriyaki Sauce", category: "Condiments & Sauces", tags: ["plant-based", "gluten"], contains: ["Soy", "Wheat", "Gluten"] },

  // ── Oils & Fats ───────────────────────────────────────────
  { name: "Olive Oil", category: "Oils & Fats", tags: ["plant-based"] },
  { name: "Vegetable Oil", category: "Oils & Fats", tags: ["plant-based"] },
  { name: "Coconut Oil", category: "Oils & Fats", tags: ["plant-based"], contains: ["Coconut"] },
  { name: "Sesame Oil", category: "Oils & Fats", tags: ["plant-based"], contains: ["Sesame"] },
  { name: "Peanut Oil", category: "Oils & Fats", tags: ["plant-based"], contains: ["Peanuts"] },
  { name: "Canola Oil", category: "Oils & Fats", tags: ["plant-based"] },
  { name: "Avocado Oil", category: "Oils & Fats", tags: ["plant-based"] },
  { name: "Sunflower Oil", category: "Oils & Fats", tags: ["plant-based"] },
  { name: "Lard", category: "Oils & Fats", tags: ["animal-product", "pork"] },
  { name: "Ghee", category: "Oils & Fats", tags: ["dairy", "animal-product"], contains: ["Casein"] },

  // ── Sweeteners ────────────────────────────────────────────
  { name: "Sugar", category: "Sweeteners", tags: ["plant-based", "high-carb"] },
  { name: "Brown Sugar", category: "Sweeteners", tags: ["plant-based", "high-carb"] },
  { name: "Honey", category: "Sweeteners", tags: ["animal-product", "high-carb"] },
  { name: "Maple Syrup", category: "Sweeteners", tags: ["plant-based", "high-carb"] },
  { name: "Agave", category: "Sweeteners", tags: ["plant-based", "high-carb"] },
  { name: "Molasses", category: "Sweeteners", tags: ["plant-based", "high-carb"] },
  { name: "Stevia", category: "Sweeteners", tags: ["plant-based"] },
  { name: "Corn Syrup", category: "Sweeteners", tags: ["plant-based", "high-carb", "processed"] },

  // ── Beverages ─────────────────────────────────────────────
  { name: "Coffee", category: "Beverages", tags: ["plant-based"] },
  { name: "Tea", category: "Beverages", tags: ["plant-based"] },
  { name: "Cocoa", category: "Beverages", tags: ["plant-based"] },
  { name: "Chocolate", category: "Beverages", tags: ["plant-based"], contains: ["Cocoa"] },
  { name: "Wine", category: "Beverages", tags: ["plant-based", "alcohol"], contains: ["Alcohol", "Sulfites"] },
  { name: "Beer", category: "Beverages", tags: ["plant-based", "alcohol", "gluten"], contains: ["Alcohol", "Gluten", "Wheat"] },

  // ── Baked Goods ───────────────────────────────────────────
  { name: "Croissant", category: "Baked Goods", tags: ["dairy", "eggs", "gluten", "high-carb"], contains: ["Gluten", "Wheat", "Lactose", "Eggs"] },
  { name: "Cake", category: "Baked Goods", tags: ["dairy", "eggs", "gluten", "high-carb"], contains: ["Gluten", "Wheat", "Eggs", "Lactose"] },
  { name: "Cookie", category: "Baked Goods", tags: ["eggs", "gluten", "high-carb"], contains: ["Gluten", "Wheat", "Eggs"] },
  { name: "Pie Crust", category: "Baked Goods", tags: ["gluten", "high-carb"], contains: ["Gluten", "Wheat"] },
  { name: "Pancake", category: "Baked Goods", tags: ["dairy", "eggs", "gluten", "high-carb"], contains: ["Gluten", "Wheat", "Eggs", "Lactose"] },
  { name: "Waffle", category: "Baked Goods", tags: ["dairy", "eggs", "gluten", "high-carb"], contains: ["Gluten", "Wheat", "Eggs", "Lactose"] },

  // ── Compounds (allergen-only tags, not recipe ingredients) ─
  { name: "Gluten", category: "Compounds", tags: ["gluten"] },
  { name: "Lactose", category: "Compounds", tags: ["dairy"] },
  { name: "Casein", category: "Compounds", tags: ["dairy"] },
  { name: "Whey", category: "Compounds", tags: ["dairy"] },
  { name: "Gelatin", category: "Compounds", tags: ["animal-product", "gelatin"] },
  { name: "Soy", category: "Compounds", tags: ["plant-based", "legume"] },
  { name: "Tree Nuts", category: "Compounds", tags: ["plant-based"] },
  { name: "Fish", category: "Compounds", tags: ["seafood", "fish"] },
  { name: "Shellfish", category: "Compounds", tags: ["seafood", "shellfish"] },
  { name: "MSG", category: "Compounds", tags: ["processed"] },
  { name: "Sulfites", category: "Compounds", tags: [] },
  { name: "Nitrates", category: "Compounds", tags: ["processed"] },
  { name: "Red Food Dye", category: "Compounds", tags: ["processed"] },
  { name: "Alcohol", category: "Compounds", tags: ["alcohol"] },
  { name: "Yeast", category: "Compounds", tags: ["plant-based"] },
];

// ── Derived lists ────────────────────────────────────────────

/** All food names as a flat array */
export const allFoodNames = foods.map((f) => f.name);

/** Get all unique category names */
export const foodCategories = [...new Set(foods.map((f) => f.category))];

/** Foods grouped by category (for UI sections) */
export const foodsByCategory = foods.reduce<Record<string, FoodItem[]>>(
  (acc, food) => {
    if (!acc[food.category]) acc[food.category] = [];
    acc[food.category].push(food);
    return acc;
  },
  {},
);

/**
 * All items that can be selected as allergens (everything in the list).
 * Use this for the allergy search dropdown.
 */
export const allergenOptions = allFoodNames;
