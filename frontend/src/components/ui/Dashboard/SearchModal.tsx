import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@components/ui/input";

import { Recipe } from "@masterchef/shared/types/recipe";

import {
  Search,
  Filter,
  ScanSearch,
  ChevronRight,
  Clock4,
  Coffee,
  UtensilsCrossed,
  Soup,
  Cookie,
  Clock,
  Timer,
  SearchAlert,
} from "lucide-react";
import { SAD_KAOMOJIS, SKILL_LEVELS } from "@masterchef/shared/constants";
import { Button } from "@components/ui/button";

const SEARCHING_PHRASES = [
  "Searching recipes...",
  "Sifting through ingredients...",
  "Checking the pantry...",
  "Consulting the cookbook...",
  "Tasting the results...",
  "Preheating the search...",
];

const MEAL_TYPES = [
  { label: "Breakfast", icon: Coffee },
  { label: "Lunch", icon: UtensilsCrossed },
  { label: "Dinner", icon: Soup },
  { label: "Snacks", icon: Cookie },
];

const TIME_RANGES = [
  { label: "< 15 mins", value: "under15", icon: Clock },
  { label: "15-30 mins", value: "15to30", icon: Timer },
  { label: "30-60 mins", value: "30to60", icon: Timer },
  { label: "1+ hours", value: "over60", icon: Timer },
];

const RECIPES_API_BASE = "/api/recipes";

interface SearchContainerProps {
  onClose: (searchResult: Recipe | undefined) => void;
}

const EXAMPLE_RECIPES: Recipe[] = [
  {
    id: "example-1",
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Spaghetti Carbonara",
    description:
      "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper. Quick and delicious!",
    imageUrl: undefined,
    cookingTime: 20,
    skillLevel: "intermediate",
    servings: 2,
    dietaryTags: ["gluten"],
    containsAllergens: ["eggs", "dairy"],
    cuisine: "Italian",
    ingredients: [
      { foodItem: "Spaghetti", amount: 200, unit: "g" },
      { foodItem: "Pancetta", amount: 100, unit: "g" },
      { foodItem: "Eggs", amount: 2, unit: "large" },
      { foodItem: "Parmesan Cheese", amount: 50, unit: "g" },
      { foodItem: "Black Pepper", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Cook spaghetti in salted boiling water until al dente.",
      "In a pan, cook pancetta until crispy.",
      "In a bowl, whisk eggs and Parmesan together.",
      "Drain pasta and combine with pancetta. Remove from heat.",
      "Quickly stir in egg mixture to create a creamy sauce.",
      "Season with black pepper and serve immediately.",
    ],
  },
  {
    id: "example-2",
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Chicken Stir Fry",
    description:
      "A quick and colorful Asian-inspired dish with tender chicken and fresh vegetables in a savory sauce.",
    imageUrl: undefined,
    cookingTime: 15,
    skillLevel: "beginner",
    servings: 2,
    dietaryTags: ["gluten"],
    containsAllergens: ["soy"],
    cuisine: "Thai",
    ingredients: [
      { foodItem: "Chicken Breast", amount: 400, unit: "g" },
      { foodItem: "Bell Peppers", amount: 2, unit: "pcs" },
      { foodItem: "Broccoli", amount: 200, unit: "g" },
      { foodItem: "Soy Sauce", amount: 3, unit: "tbsp" },
      { foodItem: "Garlic", amount: 3, unit: "cloves" },
      { foodItem: "Ginger", amount: 1, unit: "tbsp" },
    ],
    steps: [
      "Cut chicken into bite-sized pieces and vegetables into chunks.",
      "Heat oil in a wok or large skillet over high heat.",
      "Cook chicken until browned, then set aside.",
      "Stir fry vegetables until tender-crisp.",
      "Return chicken to the wok, add soy sauce, garlic, and ginger.",
      "Toss everything together and serve over rice.",
    ],
  },
];

export default function SearchContainer({ onClose }: SearchContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    mealType: string[];
    skillLevel: string[];
    cookingTime: string[];
  }>({ mealType: [], skillLevel: [], cookingTime: [] });

  const [phraseIndex, setPhraseIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading) return;
    setPhraseIndex(0);
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % SEARCHING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose(undefined);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef, onClose]);

  useEffect(() => {
    if (!searchTerm && !suggested) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      async () => {
        try {
          const params = new URLSearchParams();
          if (searchTerm) params.set("search", searchTerm);
          if (activeFilters.skillLevel.length === 1)
            params.set("skillLevel", activeFilters.skillLevel[0]);
          const res = await fetch(`${RECIPES_API_BASE}?${params.toString()}`);
          const json = await res.json();
          console.log(json);
          if (!res.ok)
            throw new Error(json?.message || "Failed to load recipes");
          setResults((json?.data?.recipes ?? []) as Recipe[]);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      },
      suggested && !searchTerm ? 0 : 300,
    );

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, suggested, activeFilters]);

  const toggleFilter = (
    category: keyof typeof activeFilters,
    value: string,
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div
      ref={containerRef}
      className="search-container w-full h-full flex items-center justify-center pointer-events-auto"
    >
      <div
        className={`search-main w-160 h-140 flex flex-col items-center justify-baseline pointer-events-auto gap-2 rounded-xl z-20 shadow-lg shadow-black/0 transition-all duration-500 ${showResults ? "mb-0" : "-mb-80"}`}
      >
        <div className="search-params w-full h-10 flex gap-4 items-center justify-end">
          <Button
            onClick={() => {
              const next = !suggested;
              setSuggested(next);
              setShowResults(next || !!searchTerm);
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-b from-secondary to-card ring-2 ring-border/30 hover:brightness-125 text-sm transition-all duration-300 ${suggested ? "text-accent ring-accent/40" : "text-foreground/70 hover:text-accent"}`}
          >
            <span className="pointer-events-none font-semibold">Suggested</span>
          </Button>
          <Button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`relative flex items-center gap-2 px-2 py-2 rounded-full bg-linear-to-b from-secondary to-card ring-2 ring-border/30 hover:brightness-125 transition-all duration-300 ${filterOpen ? "text-accent ring-accent/40" : "text-foreground/70 hover:text-accent"}`}
          >
            <Filter size={17} className="pointer-events-none" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white pointer-events-none">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
        <div
          className="search-input-container w-full h-18 relative flex items-center justify-between px-5 bg-grain3 rounded-2xl"
          style={{
            boxShadow:
              "0 0 40px rgba(0, 0, 0, 0.3), 0 0 80px rgba(0, 0, 0, 0.1), 0 0 120px rgba(0, 0, 0, 0)",
          }}
        >
          <Search className="search-icon text-accent z-20" />
          <Input
            autoFocus
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              setShowResults(!!value);
            }}
            type="text"
            placeholder="Search for recipes, and ingredients over the web..."
            className="search-input absolute top-0 left-0 w-full h-full rounded-2xl p-4 pl-15.5 bg-grain3 dark:bg-grain3 selection:bg-grain3 text-xl text-muted-foreground placeholder:text-accent/70"
          />
          <div className="flex justify-center items-center relative gap-1.5 text-sm tracking-wider select-none px-1">
            <kbd className="px-2 py-1 rounded-md bg-card/60 opacity-60">
              Ctrl
            </kbd>
            <kbd className="px-2 py-1 rounded-md bg-card/60 opacity-60">K</kbd>
          </div>
        </div>

        <div
          className={`filter-row w-full transition-all duration-500 ease-out-cubic overflow-hidden ${filterOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
        >
          <div
            className="flex items-center gap-2 pb-1 py-2 px-1 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {MEAL_TYPES.map(({ label, icon: Icon }) => {
              const isActive = activeFilters.mealType.includes(label);
              return (
                <Button
                  key={label}
                  onClick={() => toggleFilter("mealType", label)}
                  className={`filter-chip flex items-center relative overflow-hidden gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 cursor-pointer hover:brightness-105 ${isActive ? "text-accent ring-2 ring-accent/40" : "ring-2 ring-border/30 text-foreground/60 hover:text-accent"}`}
                >
                  <div
                    className={`absolute w-full h-full pointer-events-none z-0 ${isActive ? "bg-accent/20" : "bg-linear-to-b from-secondary to-card"}`}
                  />
                  <Icon size={13} className="pointer-events-none z-2" />
                  <span className="pointer-events-none z-2">{label}</span>
                </Button>
              );
            })}

            <div className="w-px h-5 bg-border/40 shrink-0 mx-1" />

            {SKILL_LEVELS.map((level) => {
              const isActive = activeFilters.skillLevel.includes(level.value);
              return (
                <Button
                  key={level.value}
                  onClick={() => toggleFilter("skillLevel", level.value)}
                  className={`filter-chip flex items-center relative overflow-hidden gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 cursor-pointer hover:brightness-105 ${isActive ? "text-accent ring-2 ring-accent/40" : "ring-2 ring-border/30 text-foreground/60 hover:text-accent"}`}
                >
                  <div
                    className={`absolute w-full h-full pointer-events-none z-0 ${isActive ? "bg-accent/20" : "bg-linear-to-b from-secondary to-card"}`}
                  />
                  <span className="pointer-events-none z-2">{level.label}</span>
                </Button>
              );
            })}

            <div className="w-px h-5 bg-border/40 shrink-0 mx-1" />

            {TIME_RANGES.map(({ label, value, icon: Icon }) => {
              const isActive = activeFilters.cookingTime.includes(value);
              return (
                <Button
                  key={value}
                  onClick={() => toggleFilter("cookingTime", value)}
                  className={`filter-chip flex items-center relative overflow-hidden gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 cursor-pointer hover:brightness-105 ${isActive ? "text-accent ring-2 ring-accent/40" : "ring-2 ring-border/30 text-foreground/60 hover:text-accent"}`}
                >
                  <div
                    className={`absolute w-full h-full pointer-events-none z-0 ${isActive ? "bg-accent/20" : "bg-linear-to-b from-secondary to-card"}`}
                  />
                  <Icon size={13} className="pointer-events-none z-2" />
                  <span className="pointer-events-none z-2">{label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="search-contents w-full h-100 relative border border-border/30 bg-grain3 rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto z-99 shadow-lg shadow-black/10"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center gap-3 py-10"
                  >
                    <ScanSearch
                      size={32}
                      className="text-accent animate-pulse"
                    />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4 }}
                        className="text-muted-foreground text-sm"
                      >
                        {SEARCHING_PHRASES[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                ) : results.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center gap-3 py-10"
                  >
                    <SearchAlert size={35} className="text-accent opacity-80"  />
                    <span className="text-accent text-xl text-center font-semibold">
                      Hmm, this is awkward...
                    </span>
                    <div className="text-muted-foreground text-center text-sm font-bold flex gap-2 items-center justify-center">
                      <span>No results found</span>
                      <span className="text-xl opacity-60">
                        {
                          SAD_KAOMOJIS[
                            Math.floor(Math.random() * SAD_KAOMOJIS.length)
                          ]
                        }
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-2"
                  >
                    {results.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => onClose(recipe)}
                        className="flex items-center gap-4 p-3 rounded-xl border border-border/30 hover:bg-card/40 shadow-md shadow-foreground/5 cursor-pointer transition-all duration-300 pointer-events-auto group"
                      >
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-md shadow-border/20 pointer-events-none"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-card/40 shrink-0 shadow-md shadow-foreground/20 pointer-events-none" />
                        )}
                        <div className="flex flex-col gap-2 w-full pointer-events-none">
                          <span className="text-sm font-bold text-foreground transition-all truncate">
                            {recipe.title}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-foreground/50">
                            <span className="flex items-center gap-1">
                              <Clock4
                                size={14}
                                className="text-foreground/70"
                              />
                              {recipe.cookingTime} mins
                            </span>
                            {recipe.cuisine && (
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-3 rounded-sm bg-foreground/40 inline-block" />
                                {recipe.cuisine}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          size={23}
                          className="pointer-events-none text-foreground mr-2"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
