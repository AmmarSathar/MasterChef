import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import TiltedCard from "@components/TiltedCard";
import { Button } from "@/components/ui/button";
import { Recipe } from "@masterchef/shared";

import { CookingPot, Clock4, SignalHigh, Share2, Pencil, Trash2, CookieIcon } from "lucide-react";

export interface RecipeContainerProps {
  recipes: Recipe[];
  currentUserId: string;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
  onSelect: (recipe: Recipe) => void;
  type: ViewMode;
}

type ViewMode = "3d" | "standard";

function getRecipeOwnerId(createdBy: unknown): string {
  if (typeof createdBy === "string") return createdBy;

  if (createdBy && typeof createdBy === "object") {
    const record = createdBy as Record<string, unknown>;
    if (typeof record.id === "string") return record.id;
    if (typeof record._id === "string") return record._id;
  }

  return "";
}

function StandardCard({
  recipe,
  isOwner,
  onEdit,
  onDelete,
  onRecipeSelect,
}: {
  recipe: Recipe;
  isOwner: boolean;
  onEdit: (r: Recipe) => void;
  onDelete: (id: string) => void;
  onRecipeSelect: (recipe: Recipe) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileTap={{ scale: 0.94, opacity: 0.7 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onRecipeSelect(recipe)}
      className="recipe-standard-view rounded-2xl overflow-hidden bg-card flex flex-col border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.04] transition-all ease-out-expo duration-300 pointer-events-auto cursor-pointer"
    >
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl}
          
          className={`w-full h-42 ${isHovered ? "h-46" : "h-42"} object-cover duration-300 delay-50 ease-out-cubic transition-all pointer-events-none`}
        />
      ) : (
        <div
          className={`w-full h-42 ${isHovered ? "h-46" : "h-42"} flex items-center justify-center duration-300 delay-50 ease-out-cubic transition-all pointer-events-none`}
        >
          <CookieIcon
            size={48}
            className={`transition-all duration-300 ${isHovered ? "text-foreground/80" : "text-foreground/30"}`}
          />
        </div>
      )}

      <div
        className={`flex flex-col gap-2 px-3 py-3 ${isHovered ? "-mb-4" : "mb-0"} delay-50 transition-all duration-300 ease-out-cubic pointer-events-none`}
      >
        <span className="font-semibold text-foreground text-sm truncate">
          {recipe.title.length > 25
            ? recipe.title.slice(0, 25) + ".."
            : recipe.title}
        </span>

        <div className="recipe-info flex flex-col justify-between flex-1 rounded-b-2xl">
          <div className="recipe-details flex flex-col w-full gap-1 items-center justify-baseline text-xs text-accent text-left">
            <div className="prep-diff flex w-full items-center justify-between px-0.5">
              <span className="flex items-center justify-center gap-1">
                <Clock4 size={13} className="brightness-125" />{" "}
                {recipe.prepingTime}m
              </span>
              <span className="flex items-center justify-center gap-1">
                <SignalHigh size={13} className="brightness-125" />{" "}
                {recipe.skillLevel}
              </span>
            </div>

            <div className="cook-time w-full px-0.5">
              <span className="flex items-center justify-baseline gap-1">
                <CookingPot size={13} className="brightness-125" />{" "}
                {recipe.cookingTime}m
              </span>
            </div>
          </div>
        </div>

        <div
          className={`recipe-options flex items-center justify-between w-full ${isHovered ? "pt-0" : "pt-2"} px-0.5 duration-300 ease-out-cubic transition-all pointer-events-auto`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-2 h-auto w-auto rounded-full"
            >
              <Share2 size={13} />
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
                className="p-2 h-auto w-auto rounded-full"
              >
                <Pencil size={13} />
              </Button>
            )}
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe.id);
              }}
              className="p-2 h-auto w-auto rounded-full hover:bg-destructive/60"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TiltedRecipeCard({
  recipe,
  isOwner,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  isOwner: boolean;
  onEdit: (r: Recipe) => void;
  onDelete: (id: string) => void;
  onRecipeSelect: (recipe: Recipe) => void;
}) {
  return (
    <TiltedCard
      key={recipe.id}
      imageSrc={recipe.imageUrl}
      altText={recipe.title}
      containerWidth="100%"
      containerHeight="16rem"
      imageWidth="100%"
      imageHeight="16rem"
      rotateAmplitude={6}
      scaleOnHover={1.04}
      showMobileWarning={false}
      showTooltip={false}
      displayOverlayContent
      overlayContent={
        <div className="w-full h-full relative px-4 py-5 flex flex-col gap-3 bg-linear-to-b from-card/80 to-card/40 rounded-lg">
          <span className="font-semibold text-foreground text-lg truncate brightness-150">
            {recipe.title.length > 25
              ? recipe.title.slice(0, 25) + ".."
              : recipe.title}
          </span>

          <div className="flex flex-col w-full gap-1 text-xs text-foreground font-semibold">
            <div className="flex w-full items-center justify-between px-0.5">
              <span className="flex items-center gap-1">
                <Clock4 size={13} className="brightness-150" />{" "}
                {recipe.prepingTime}m
              </span>
              <span className="flex items-center gap-1">
                <SignalHigh size={13} className="brightness-150" />{" "}
                {recipe.skillLevel}
              </span>
            </div>
            <div className="w-full px-0.5">
              <span className="flex items-center gap-1">
                <CookingPot size={13} className="brightness-150" />{" "}
                {recipe.cookingTime}m
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between self-end w-full pt-5">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
              onClick={(e) => {
                e.stopPropagation();
              }}
                className="p-1.5 h-auto w-auto rounded-full text-foreground hover:bg-white/20"
              >
                <Share2 size={13} />
              </Button>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
                  className="p-1.5 h-auto w-auto rounded-full text-foreground hover:bg-white/20"
                >
                  <Pencil size={13} />
                </Button>
              )}
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe.id);
              }}
                className="p-1.5 h-auto w-auto rounded-full text-foreground hover:bg-destructive/70"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
}

export function RecipeContainer({
  recipes,
  currentUserId,
  onEdit,
  onDelete,
  onSelect,
  type,
}: RecipeContainerProps) {
  const [viewMode] = useState<ViewMode>(type || "standard");

  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const effectiveMode: ViewMode = isMobile ? "standard" : viewMode;

  return (
    <div className="flex flex-col gap-4 w-full flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-6">
      <div className="recipe-container grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-4 w-full pt-10">
        <AnimatePresence>
          {recipes.map((recipe) => {
            const isOwner = getRecipeOwnerId(recipe.createdBy) === currentUserId;

            if (effectiveMode === "standard") {
              return (
                <StandardCard
                  key={recipe.id}
                  recipe={recipe}
                  isOwner={isOwner}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRecipeSelect={(r) => onSelect(r)}
                />
              );
            }

            return (
              <TiltedRecipeCard
                key={recipe.id}
                recipe={recipe}
                isOwner={isOwner}
                onEdit={onEdit}
                onDelete={onDelete}
                onRecipeSelect={(r) => onSelect(r)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
