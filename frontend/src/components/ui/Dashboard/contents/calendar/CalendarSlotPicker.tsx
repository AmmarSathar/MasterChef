import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock4, CookingPot, CookieIcon } from "lucide-react";
import axios from "axios";
import type { Recipe } from "@masterchef/shared/types";
import { useUser } from "@/context/UserContext";

const BASE = import.meta.env.VITE_BASE_API_URL as string;
const PAGE_SIZE = 6;

// ── Props ─────────────────────────────────────────────────────

export interface CalendarSlotPickerProps {
  onPick: (recipe: Recipe) => void;
  onClose: () => void;
  submitting?: boolean;
}

// ── Component ─────────────────────────────────────────────────

export default function CalendarSlotPicker({
  onPick,
  onClose,
  submitting = false,
}: CalendarSlotPickerProps) {
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      createdBy: user.id,
    });

    axios
      .get<{ data: { recipes: Recipe[]; totalPages: number } }>(
        `${BASE}/recipes?${params.toString()}`,
        { withCredentials: true },
      )
      .then((res) => {
        setRecipes(res.data.data.recipes);
        setTotalPages(res.data.data.totalPages ?? 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, user?.id]);

  // Pad to full grid so layout stays stable
  const gridItems: (Recipe | null)[] = [
    ...recipes,
    ...Array(Math.max(0, PAGE_SIZE - recipes.length)).fill(null),
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="cal-picker-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <motion.div
        key="cal-picker-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
        className="fixed top-0 right-0 h-screen w-[30%] min-w-64 bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-2 shrink-0 border-b border-border/40">
          <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
            Pick a Recipe
          </h2>
        </div>

        {/* Recipe grid */}
        <div className="flex-1 overflow-hidden p-2">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading…</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-4">
                No recipes yet. Create one to get started.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 grid-rows-3 gap-2 h-full">
              {gridItems.map((recipe, i) =>
                recipe ? (
                  <motion.button
                    key={recipe.id}
                    type="button"
                    whileTap={{ scale: 0.96, opacity: 0.8 }}
                    onClick={() => !submitting && onPick(recipe)}
                    disabled={submitting}
                    className="w-full h-full flex flex-col rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="w-full h-24 shrink-0 bg-secondary/40 flex items-center justify-center overflow-hidden">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CookieIcon size={32} className="text-foreground/20" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 px-2 py-2 flex-1">
                      <span className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                        {recipe.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-accent mt-auto">
                        <span className="flex items-center gap-0.5">
                          <Clock4 size={10} />
                          {recipe.prepingTime ?? 0}m
                        </span>
                        <span className="flex items-center gap-0.5">
                          <CookingPot size={10} />
                          {recipe.cookingTime ?? 0}m
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ) : (
                  <div
                    key={`empty-${i}`}
                    className="rounded-xl border border-border/20 bg-secondary/10"
                  />
                ),
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-2 shrink-0 flex items-center justify-end gap-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground mr-auto">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 rounded-lg hover:bg-secondary transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
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
