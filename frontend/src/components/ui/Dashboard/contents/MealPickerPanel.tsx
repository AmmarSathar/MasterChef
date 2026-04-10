import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
import { addMealPlanEntry } from "@/lib/api/meal-plan";

import { ChevronLeft, ChevronRight, Clock4, CookingPot, CookieIcon, Plus } from "lucide-react";

import { type Recipe } from "@masterchef/shared/types";
import { type MealEntry, type SlotName, type DayName } from "@/lib/api/meal-plan";

const BASE = import.meta.env.VITE_BASE_API_URL as string;
const PAGE_SIZE = 6;

function RecipePickerCard({
  recipe,
  onSelect,
  isSubmitting,
}: {
  recipe: Recipe;
  onSelect: () => void;
  isSubmitting: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96, opacity: 0.8 }}
      onClick={onSelect}
      disabled={isSubmitting}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full h-full flex flex-col rounded-xl overflow-hidden bg-card border border-border/50 grayscale-25 brightness-95 shadow-sm hover:shadow-md hover:scale-[1.02] hover:grayscale-0 hover:brightness-100 transition-all duration-200 cursor-pointer text-left"
    >
      <div
        className={`w-full ${isHovering ? "h-35" : "h-30"} shrink-0 bg-secondary/40 flex items-center justify-center overflow-hidden pointer-events-none transition-all duration-300 ease-out-cubic`}
        style={{
          maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 90%, transparent 100%)",
        }}
      >
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} className="w-full h-full object-cover" />
        ) : (
          <CookieIcon size={32} className="text-foreground/20" />
        )}
      </div>

      <div className="flex flex-col gap-1 px-3 py-3 pb-4 flex-1 pointer-events-none">
        <span className="text-sm font-semibold text-foreground/80 leading-tight line-clamp-2">
          {recipe.title}
        </span>
        <div className="flex items-center gap-2 text-xs text-accent mt-auto scale-90 origin-left">
          <span className="flex items-center gap-0.5">
            <Clock4 size={12} />
            {recipe.prepingTime ?? 0}m
          </span>
          <span className="flex items-center gap-0.5">
            <CookingPot size={12} />
            {recipe.cookingTime ?? 0}m
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ backdropFilter: "blur(0px)", scale: "0.95", opacity: 0 }}
            animate={{ backdropFilter: "blur(2px)", scale: "1", opacity: 1 }}
            exit={{ backdropFilter: "blur(0px)", scale: "0.95", opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm bg-card/50"
          >
            <Spinner variant="infinite" size={28} className="text-accent" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function RecipePickerCardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden bg-card border border-border/50">
      <div className="w-full h-24 shrink-0 bg-muted animate-pulse" />
      <div className="flex flex-col gap-1.5 px-2 py-2 flex-1">
        <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
        <div className="h-3 w-3/5 rounded bg-muted animate-pulse" />
        <div className="h-2.5 w-16 rounded bg-muted animate-pulse mt-auto" />
      </div>
    </div>
  );
}

export interface MealPickerPanelProps {
  slot: SlotName;
  dayName: DayName;
  mealPlanId: string;
  existingRecipeIds?: Set<string>;
  onSelect: (entry: MealEntry) => void;
  onClose: () => void;
}

export default function MealPickerPanel({
  slot,
  dayName,
  mealPlanId,
  existingRecipeIds = new Set<string>(),
  onSelect,
  onClose,
}: MealPickerPanelProps) {
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      createdBy: user.id,
    });

    axios
      .get<{
        data: { recipes: Recipe[]; totalPages: number };
      }>(`${BASE}/recipes?${params.toString()}`, { withCredentials: true })
      .then((res) => {
        setRecipes(res.data.data.recipes);
        setTotalPages(res.data.data.totalPages ?? 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, user?.id]);

  const handleSelect = async (recipe: Recipe) => {
    if (submittingId) return;

    if (existingRecipeIds.has(recipe.id)) {
      toast.error("This meal is already in your plan!");
      return;
    }

    setSubmittingId(recipe.id);
    try {
      const { entryId } = await addMealPlanEntry(mealPlanId, {
        dayOfWeek: dayName,
        mealType: slot,
        recipeId: recipe.id,
      });

      const newEntry: MealEntry = {
        entryId,
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description,
        imageUrl: recipe.imageUrl ?? "",
        cookingTime: recipe.cookingTime ?? 0,
        notes: "",
      };

      onSelect(newEntry);
    } catch (err) {
      console.error("[MealPicker] Failed to assign recipe:", err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Failed to add recipe. Please try again.");
      setSubmittingId(null);
    }
  };

  type GridItem = Recipe | "add" | null;
  const isLastPage = page >= totalPages;
  const gridItems: GridItem[] = [...recipes];
  if (isLastPage && recipes.length < PAGE_SIZE) gridItems.push("add");
  while (gridItems.length < PAGE_SIZE) gridItems.push(null);

  return (
    <>
      <motion.div
        key="meal-picker-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={submittingId ? undefined : onClose}
      />

      <motion.div
        key="meal-picker-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
        className="fixed top-0 right-0 h-screen w-[30%] min-w-64 bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col p-3 py-5"
      >
        <div className="p-3 py-4 shrink-0 border-b border-border/40">
          <h2 className="text-2xl font-bold text-accent/70 tracking-wide uppercase">
            Recipes
          </h2>
        </div>

        <div className="flex-1 overflow-hidden p-2 py-6 mt-4 px-6 relative">
          <div className="grid-backdrop absolute flex flex-col items-center justify-between px-3 py-2 w-full h-full rounded-xl border-none top-0 left-0 pointer-events-none">
            <div className="w-full h-10 flex items-center justify-between relative">
              <div className="h-full w-10 rounded-tl-xl border-t-4 border-l-4 border-foreground/20"></div>
              <div className="h-full w-10 rounded-tr-xl border-t-4 border-r-4 border-foreground/20"></div>
            </div>
            <div className="w-full h-10 flex items-center justify-between relative">
              <div className="h-full w-10 rounded-bl-xl border-b-4 border-l-4 border-foreground/20"></div>
              <div className="h-full w-10 rounded-br-xl border-b-4 border-r-4 border-foreground/20"></div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="picker-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 grid-rows-3 gap-2 h-full"
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <RecipePickerCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : recipes.length === 0 ? (
              <motion.div
                key="picker-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground text-center px-4">
                  No recipes yet. Create one to get started.
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="picker-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 grid-rows-3 gap-2 h-full"
              >
                {gridItems.map((item, i) =>
                  item === "add" ? (
                    <button
                      key="add-recipe"
                      type="button"
                      onClick={() => {
                        window.location.hash = "recipe";
                        onClose();
                      }}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-card/40 text-foreground/50 hover:border-accent/60 hover:text-foreground transition-all duration-200 cursor-pointer"
                    >
                      <Plus size={18} className="pointer-events-none" />
                      <span className="text-xs font-semibold pointer-events-none">
                        New Recipe
                      </span>
                    </button>
                  ) : item ? (
                    <RecipePickerCard
                      key={item.id}
                      recipe={item}
                      onSelect={() => handleSelect(item)}
                      isSubmitting={submittingId === item.id}
                    />
                  ) : (
                    <div
                      key={`empty-${i}`}
                      className="rounded-xl border border-border/20 bg-secondary/10"
                    />
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-2 shrink-0 flex items-center justify-end gap-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground mr-auto">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!!submittingId || page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 rounded-lg hover:bg-secondary transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={!!submittingId || page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-1.5 rounded-lg hover:bg-secondary transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
