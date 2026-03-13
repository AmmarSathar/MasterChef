import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";

import { motion, AnimatePresence } from "framer-motion";

import { Recipe } from "@masterchef/shared";

interface RecipeViewProps {
  recipe: Recipe;
  isOwner: boolean;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

export default function RecipeView({
  recipe,
  isOwner,
  onEdit,
  onDelete,
}: RecipeViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(3px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="recipeCreator-container w-full h-full fixed top-0 left-0 flex items-center justify-center z-50 bg-background/50"
    >
      <img className="recipe-image w-full object-cover" />

      <div className="recipe-header">
        
      </div>
    </motion.div>
  );
}
