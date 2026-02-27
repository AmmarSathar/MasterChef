import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  CookingPot,
  SearchAlert
} from "lucide-react";
import { CUISINES, SKILL_LEVELS, dietaryOptions } from "@masterchef/shared/constants";
import type { Recipe } from "@masterchef/shared";

const RECENT_KEY = "mc_recent_searches";
const MAX_RECENT = 5;

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addRecent(term: string) {
  const prev = getRecent().filter((t) => t !== term.trim());
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([term.trim(), ...prev].slice(0, MAX_RECENT))
  );
}

function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
}

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [suggested, setSuggested] = useState<Recipe[]>([]);
  const [suggestedTotal, setSuggestedTotal] = useState(0);

  const [recent, setRecent] = useState<string[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [cuisine, setCuisine] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [maxTime, setMaxTime] = useState<number | "">("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);

  const hasActiveFilter =
    !!cuisine || !!skillLevel || !!maxTime || dietaryTags.length > 0;
  const isSearching = !!query.trim() || hasActiveFilter;

  useEffect(() => {
    if (!open) return;
    setRecent(getRecent());
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setTotal(null);
      setActiveIndex(-1);
      setShowFilters(false);
      setCuisine("");
      setSkillLevel("");
      setMaxTime("");
      setDietaryTags([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || suggested.length) return;
    fetch("/api/recipes?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSuggested(data.data.recipes ?? []);
          setSuggestedTotal(data.data.total ?? 0);
        }
      })
      .catch(() => {});
  }, [open, suggested.length]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim() && !hasActiveFilter) {
        setResults([]);
        setTotal(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "8" });
        if (q.trim()) params.set("search", q.trim());
        if (cuisine) params.set("cuisine", cuisine);
        if (skillLevel) params.set("skillLevel", skillLevel);
        if (maxTime) params.set("max_time", String(maxTime));
        if (dietaryTags.length) params.set("dietary_tags", dietaryTags.join(","));

        const res = await fetch(`/api/recipes?${params}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data.recipes ?? []);
          setTotal(data.data.total ?? 0);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [cuisine, skillLevel, maxTime, dietaryTags, hasActiveFilter]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 280);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);


  const handleSelect = (recipe: Recipe) => {
    if (query.trim()) addRecent(query.trim());
    // TODO: navigate to /recipes/:id when route exists
    void recipe.id;
    onClose();
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleClearRecent = () => {
    clearRecent();
    setRecent([]);
  };

  const toggleDietaryTag = (tag: string) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setCuisine("");
    setSkillLevel("");
    setMaxTime("");
    setDietaryTags([]);
  };

  useEffect(() => {
    if (!open) return;
    const displayList = isSearching ? results : suggested;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, displayList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0 && displayList[activeIndex]) {
        handleSelect(displayList[activeIndex]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, suggested, activeIndex, isSearching]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLButtonElement>("[data-recipe-item]");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const displayList = isSearching ? results : suggested;
  const footerCount = isSearching ? (total ?? 0) : suggestedTotal;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <div className="search-backdrop absolute inset-0 bg-background/50 backdrop-blur-sm" />

          <motion.div
            className="relative w-160 h-120 flex flex-col rounded-2xl border border-border/70 bg-card shadow-2xl shadow-black/60 overflow-hidden -mt-20"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-6 border-b border-border/50">
              <Search size={17} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                placeholder="Search for recipes, or ingredients..."
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <div className="flex items-center gap-2 shrink-0">
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters((f) => !f)}
                  title="Toggle filters"
                  className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-all ease-out-cubic duration-200 ${
                    showFilters || hasActiveFilter
                      ? "bg-primary/20 border-primary/40 text-accent"
                      : "border-border/40 text-muted-foreground hover:border-border/70 hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontal size={12} />
                  <span className ="select-none pointer-events-none hidden sm:inline">Filters</span>
                  {hasActiveFilter && (
                    <span className ="select-none pointer-events-none w-4 h-4 rounded-full bg-accent/80 text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                      {(cuisine ? 1 : 0) +
                        (skillLevel ? 1 : 0) +
                        (maxTime ? 1 : 0) +
                        dietaryTags.length}
                    </span>
                  )}
                </button>
                <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md border border-border/40 bg-secondary/60 text-xs text-muted-foreground select-none">
                  <kbd className="font-sans">Ctrl</kbd>
                  <span className ="select-none pointer-events-none mx-0.5 opacity-60">+</span>
                  <kbd className="font-sans">K</kbd>
                </div>
              </div>
            </div>

            {/* ── Filter panel ── */}
            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-b border-border/50"
                >
                  <div className="p-4 flex flex-col gap-3">
                    {/* Row 1 – dropdowns + time */}
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        className="bg-input border border-border/50 text-foreground text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                      >
                        <option value="">All Cuisines</option>
                        {CUISINES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="bg-input border border-border/50 text-foreground text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                      >
                        <option value="">All Levels</option>
                        {SKILL_LEVELS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5 bg-input border border-border/50 rounded-lg px-3 py-1.5">
                        <Clock size={11} className="text-muted-foreground" />
                        <input
                          type="number"
                          min={1}
                          placeholder="Max mins"
                          value={maxTime}
                          onChange={(e) =>
                            setMaxTime(e.target.value ? Number(e.target.value) : "")
                          }
                          className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground w-16 outline-none"
                        />
                      </div>

                      {hasActiveFilter && (
                        <button
                          onClick={resetFilters}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive/80 hover:bg-destructive/20 transition-all"
                        >
                          <RotateCcw size={10} />
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Row 2 – dietary tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {dietaryOptions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleDietaryTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${
                            dietaryTags.includes(tag)
                              ? "bg-primary/30 border-primary/50 text-accent font-medium"
                              : "bg-secondary/40 border-border/40 text-muted-foreground hover:border-border/70 hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Scrollable content ── */}
            <div ref={listRef} className="overflow-y-auto flex-1">
              {/* Recent searches */}
              {!isSearching && recent.length > 0 && (
                <div className="px-4 pt-4 pb-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className ="select-none pointer-events-none text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Recent Searches
                    </span>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary/60 border border-border/40 text-foreground/70 hover:bg-secondary hover:text-foreground hover:border-border/70 transition-all duration-200"
                      >
                        <Clock size={10} className="text-muted-foreground" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-7 pt-5 pb-5">
                {isSearching ? (
                  <span className ="select-none pointer-events-none text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    {loading
                      ? "Searching…"
                      : total !== null
                      ? `${total} Result${total !== 1 ? "s" : ""}`
                      : "Results"}
                  </span>
                ) : (
                  <>
                    <span className ="select-none pointer-events-none text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Suggested Recipes
                    </span>
                    <button
                      onClick={() => setSuggested([])}
                      className="text-xs text-muted-foreground hover:text-destructive hover:brightness-125 transition-all duration-300"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>

              {loading && (
                <div className="flex flex-col gap-1 px-4 pb-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center p-2.5 rounded-xl animate-pulse"
                    >
                      <div className="w-14 h-14 rounded-xl bg-muted/40 shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-muted/40 rounded w-2/3" />
                        <div className="h-3 bg-muted/25 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && (
                <div className="flex flex-col gap-0.5 px-4 pb-3">
                  {displayList.map((recipe, i) => (
                    <button
                      key={recipe.id}
                      data-recipe-item
                      onClick={() => handleSelect(recipe)}
                      className={`w-full flex items-center gap-3 p-3 px-5 rounded-xl text-left transition-all duration-150 border group ${
                        activeIndex === i
                          ? "bg-primary/15 border-primary/30"
                          : "border-transparent hover:bg-secondary/40 hover:border-border/30"
                      }`}
                    >
                      <div className="w-17 h-17 rounded-xl bg-muted/30 overflow-hidden shrink-0 border border-border/30">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl select-none">
                            <CookingPot size={23} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className ="select-none pointer-events-none block text-sm font-semibold text-foreground truncate">
                          {recipe.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className ="select-none pointer-events-none flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={10} />
                            {recipe.cookingTime} mins
                          </span>
                          {recipe.cuisine && (
                            <span className ="select-none pointer-events-none text-[11px] text-accent/80 border border-accent/25 px-2 py-0.5 rounded-full leading-none">
                              {recipe.cuisine}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={14}
                        className="text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 transition-colors"
                      />
                    </button>
                  ))}

                  {/* Empty state */}
                  {isSearching && results.length === 0 && (
                    <div className="py-10 text-center flex flex-col items-center gap-2">
                      <span className ="select-none pointer-events-none text-3xl">
                        <SearchAlert size={36} className="text-info brightness-50" />
                      </span>
                      <p className="text-sm text-muted-foreground">
                        No recipes found.
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        Try different keywords or adjust your filters.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-secondary/20 shrink-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className ="select-none pointer-events-none flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded-md border border-border/50 font-sans text-[11px]">
                    ESC
                  </kbd>
                  to close
                </span>
                <span className ="select-none pointer-events-none flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded-md border border-border/50 font-sans text-[11px]">
                    ↑↓
                  </kbd>
                  to navigate
                </span>
              </div>
              <span className ="select-none pointer-events-none text-xs text-muted-foreground">
                {footerCount} total recipes available
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
