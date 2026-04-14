import { motion } from "framer-motion";

import { Recipe } from "@masterchef/shared";

import { Badge } from "@components/ui/badge";

import {
  X,
  Pencil,
  User,
  Clock4,
  CookingPot,
  Users,
  Trash2,
  BookmarkPlus,
  CalendarMinus,
} from "lucide-react";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

interface RecipeViewProps {
  recipe: Recipe;
  isOwner: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
  onRemoveFromSlot?: () => void;
  onAddToCollection?: (recipe: Recipe) => void;
  isAddingToCollection?: boolean;
}

export default function RecipeView({
  recipe,
  isOwner,
  onClose,
  onEdit,
  onDelete,
  onRemoveFromSlot,
  onAddToCollection,
  isAddingToCollection = false,
}: RecipeViewProps) {
  const { user, loading } = useUser();

  const totalTime =
    (recipe.prepingTime ?? 0) + (recipe.cookingTime ?? recipe.cookingTime ?? 0);

  useEffect(() => {
    if (loading) return;
  });

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(3px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="recipe-view-overlay w-full h-full py-10 fixed top-0 left-0 flex items-center justify-center z-90 bg-background/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="recipe-view-card w-full max-w-4xl max-h-full rounded-4xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/40 relative overflow-y-scroll overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fixed top-6 left-5 flex items-center gap-2 z-20">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-card/60 hover:bg-card/90 ring-2 ring-border/40 transition-all duration-200"
          >
            <X size={18} className="text-foreground pointer-events-none" />
          </button>

          {isOwner && (
            <button
              onClick={() => onEdit(recipe)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-card/60 hover:bg-card/90 ring-2 ring-border/40 transition-all duration-200"
            >
              <Pencil
                size={16}
                className="text-foreground pointer-events-none"
              />
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="text-foreground/70 w-10 h-10 rounded-full flex items-center justify-center bg-card/50 hover:bg-destructive/70 hover:text-foreground ring-2 ring-border/40 transition-all duration-200"
            >
              <Trash2 size={16} className="pointer-events-none" />
            </button>
          )}
          {onRemoveFromSlot && (
            <button
              onClick={onRemoveFromSlot}
              className="h-10 px-3 rounded-full flex items-center justify-center gap-2 bg-card/70 hover:bg-card/90 ring-2 ring-border/40 transition-all duration-200 text-sm font-semibold text-foreground/85"
            >
              <CalendarMinus size={15} className="pointer-events-none" />
              <span className="pointer-events-none">Remove from slot</span>
            </button>
          )}
          {!isOwner && onAddToCollection && (
            <button
              onClick={() => onAddToCollection(recipe)}
              disabled={isAddingToCollection}
              className="h-10 px-3 rounded-full flex items-center justify-center gap-2 bg-card/70 hover:bg-card/90 ring-2 ring-border/40 transition-all duration-200 text-sm font-semibold text-foreground/85 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <BookmarkPlus size={15} className="pointer-events-none" />
              <span className="pointer-events-none">
                {isAddingToCollection ? "Adding..." : "Add to Collection"}
              </span>
            </button>
          )}
        </div>

        <div className="w-full h-90 relative z-0">
          <div className="absolute inset-0 bg-linear-to-t from-background-dark via-transparent to-transparent w-full h-full z-99" />
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              className="w-full h-full object-cover brightness-95 contrast-95"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 90%, transparent 100%)",
              }}
            />
          ) : (
            <div
              className="w-full h-full bg-linear-to-tr from-secondary/40 to-background/40"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 90%, transparent 100%)",
              }}
            />
          )}
        </div>

        <div className="w-full h-full flex flex-col gap-5 px-7 py-6 overflow-hidden">
          <div className="w-full flex flex-col gap-3">
            <div className="recipe-tags w-full flex flex-row gap-2 flex-wrap">
              {(recipe.dietaryTags ?? []).map((tag) => (
                <Badge
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent ring-2 ring-border transition-all duration-200"
                >
                  {tag}
                </Badge>
              ))}

              <Badge
                key="skill-level"
                className="px-3 py-1 rounded-full text-xs bg-destructive/10 text-destructive font-bold brightness-125 ring-2 ring-border/60 transition-all duration-200"
              >
                {recipe.skillLevel
                  ? `${recipe.skillLevel.charAt(0).toUpperCase()}${recipe.skillLevel.substring(1)}`
                  : "Beginner"}
              </Badge>
            </div>

            <span className="recipe-title text-left text-5xl font-bold text-foreground/95 leading-tight">
              {recipe.title}
            </span>

            <div className="recipe-user-description w-full flex gap-4 py-2 items-start justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 ring-2 ring-border/70 flex items-center justify-center overflow-hidden ml-1 mt-1">
                {/* We will still have to update the backend so that we also store the recipe creator's details (or make a getUser backend route) */}
                {user?.pfp ? (
                  <img
                    src={user.pfp}
                    alt={recipe.createdBy}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-accent" />
                )}
              </div>

              <div className="recipe-decription w-full flex flex-col gap-1">
                <span className="font-semibold text-foreground/80 text-sm">
                  {/* This gives the user id, we should modify the backend to have a getUser route and get the actual username */}
                  {recipe.createdByName || recipe.createdBy}
                </span>
                <span className="text-xs text-accent/80">
                  {recipe.description
                    ? recipe.description.length > 200
                      ? recipe.description.slice(0, 200) + "..."
                      : recipe.description
                    : "No description provided."}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full border-y border-border/80" />

          <div className="w-full grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <Clock4 size={16} className="text-accent/70" />
              <span className="text-xs scale-90 uppercase tracking-wider text-foreground/40 font-bold">
                prep
              </span>
              <span className="text-sm font-bold text-foreground/85">
                {recipe.prepingTime ?? 0} min
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <CookingPot size={16} className="text-accent/70" />
              <span className="text-xs scale-90 uppercase tracking-wider text-foreground/40 font-bold">
                cook
              </span>
              <span className="text-sm font-bold text-foreground/85">
                {recipe.cookingTime ?? 0} min
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <Users size={16} className="text-accent/70" />
              <span className="text-xs scale-90 uppercase tracking-wider text-foreground/40 font-bold">
                servings
              </span>
              <span className="text-sm font-bold text-foreground/85">
                {recipe.servings ?? 1}{" "}
                {recipe.servings === 1 ? "portion" : "portions"}
              </span>
            </div>
          </div>

          <div className="w-full border-y border-border/80" />

          {recipe.containsAllergens && recipe.containsAllergens.length > 0 && (
            <div className="recipe-allergens w-full gap-2 flex flex-row items-center">
              <span className="text-sm font-semibold uppercase text-accent/70 tracking-wider">
                May contain:
              </span>
              <div className="flex flex-row gap-2 flex-wrap">
                {(recipe.containsAllergens ?? []).map((allergen) => (
                  <Badge
                    key={allergen}
                    variant="destructive"
                    className="px-3 py-1 rounded-full bg-destructive/30 text-destructive/80 ring-2 ring-destructive/25"
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="w-full flex-1 grid grid-cols-1 py-5 pl-2 md:grid-cols-2 gap-6 overflow-hidden min-h-0">
            <div className="flex flex-col min-h-0">
              <span className="text-lg font-bold text-foreground/85">
                Ingredients
              </span>
              <div className="mt-3 flex-1 overflow-y-auto pr-2">
                <ul className="flex flex-col gap-2 text-sm text-foreground/75">
                  {(recipe.ingredients ?? []).map((ing, i) => (
                    <li key={`${ing.foodItem}-${i}`} className="flex gap-2">
                      <span className="text-foreground/40">•</span>
                      <span className="flex-1">
                        {ing.amount ? `${ing.amount} ` : ""}
                        {ing.unit ? `${ing.unit} ` : ""}
                        {ing.foodItem}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col min-h-0">
              <span className="text-lg font-bold text-foreground/85">
                Instructions
              </span>
              <div className="mt-3 flex-1 overflow-y-auto pr-2">
                <ol className="flex flex-col gap-3 text-sm text-foreground/75">
                  {(recipe.steps ?? []).map((step, i) => (
                    <li
                      key={`${i}-${step.slice(0, 10)}`}
                      className="flex gap-3"
                    >
                      <span className="w-6 h-6 shrink-0 rounded-full bg-secondary/40 ring-2 ring-border/25 flex items-center justify-center text-[11px] font-bold text-foreground/70">
                        {i + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
