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
exports.MealPlanEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("@masterchef/shared/constants");
const mealPlanEntrySchema = new mongoose_1.Schema({
    mealPlanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "MealPlan",
        required: [true, "Meal plan ID is required"],
        index: true,
    },
    dayOfWeek: {
        type: String,
        required: [true, "Day of week is required"],
        enum: {
            values: constants_1.dayOfWeekValues,
            message: "Day of week must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
        },
    },
    mealType: {
        type: String,
        required: [true, "Meal type is required"],
        enum: {
            values: constants_1.mealTypeValues,
            message: "Meal type must be one of: breakfast, lunch, dinner, snack",
        },
    },
    recipeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Recipe",
        required: [true, "Recipe ID is required"],
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, "Notes cannot exceed 500 characters"],
    },
}, {
    timestamps: true,
});
// Duplicate prevention: one slot per (mealPlanId, dayOfWeek, mealType)
mealPlanEntrySchema.index({ mealPlanId: 1, dayOfWeek: 1, mealType: 1 }, { unique: true });
exports.MealPlanEntry = mongoose_1.default.model("MealPlanEntry", mealPlanEntrySchema);
//# sourceMappingURL=meal-plan-entry.model.js.map