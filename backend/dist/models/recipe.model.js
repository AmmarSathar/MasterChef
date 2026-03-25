"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recipe = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("@masterchef/shared/constants");
const ingredientSchema = new mongoose_1.Schema({
    foodItem: {
        type: String,
        required: [true, "Ingredient food item name is required"],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, "Ingredient amount is required"],
        min: [0, "Amount must be non-negative"],
    },
    unit: {
        type: String,
        required: [true, "Ingredient unit is required"],
        trim: true,
    },
    notes: { type: String, trim: true },
}, { _id: false });
const recipeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    ingredients: {
        type: [ingredientSchema],
        validate: {
            validator: (v) => v.length > 0,
            message: "At least one ingredient is required",
        },
    },
    steps: {
        type: [String],
        validate: {
            validator: (v) => v.length > 0,
            message: "At least one step is required",
        },
    },
    cookingTime: {
        type: Number,
        required: [true, "Cooking time is required"],
        min: [1, "Cooking time must be at least 1 minute"],
    },
    servings: {
        type: Number,
        required: [true, "Servings is required"],
        min: [1, "Servings must be at least 1"],
    },
    skillLevel: {
        type: String,
        required: [true, "Skill level is required"],
        enum: {
            values: constants_1.skillLevelValues,
            message: "Skill level must be one of: {VALUE}",
        },
    },
    cuisine: {
        type: String,
        enum: {
            values: constants_1.cuisineOptions,
            message: "Cuisine must be one of: {VALUE}",
        },
    },
    imageUrl: { type: String, trim: true },
    dietaryTags: { type: [String], default: [], index: true },
    containsAllergens: { type: [String], default: [], index: true },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Creator user ID is required"],
        index: true,
    },
    isPublic: { type: Boolean, default: false },
}, {
    timestamps: true,
});
recipeSchema.index({ dietaryTags: 1, skillLevel: 1 });
recipeSchema.index({ title: "text", description: "text" });
exports.Recipe = mongoose_1.default.model("Recipe", recipeSchema);
//# sourceMappingURL=recipe.model.js.map