import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@components/ui/input";
import Badge from "@components/ui/badge";

import { Recipe } from "@masterchef/shared/types/recipe";

import { Search, SearchAlert, Filter, Lightbulb } from "lucide-react";
import { SAD_KAOMOJIS } from "@masterchef/shared/constants";

interface SearchContainerProps {
  onClose: (searchResult: Recipe | undefined) => void;
}

export default function SearchContainer({ onClose }: SearchContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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
    console.log(showResults);
  }, [showResults]);

  return (
    <div
      ref={containerRef}
      className="search-container w-full h-full flex items-center justify-center pointer-events-auto"
    >
      <div
        className={`search-main w-160 h-140 flex flex-col items-center justify-baseline pointer-events-auto gap-2 rounded-xl z-20 shadow-lg shadow-black/0 transition-all duration-500 ${showResults ? "mb-0" : "-mb-80"}`}
      >
        <div className="search-params w-full h-10 flex gap-4 items-center justify-end">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-b from-secondary to-card ring-2 ring-border/30 hover:brightness-125 text-sm text-foreground/70 hover:text-accent transition-all duration-300">
            <span className="pointer-events-none font-semibold">Suggested</span>
          </button>
          <button className="flex items-center gap-2 px-2 py-2 rounded-full bg-linear-to-b from-secondary to-card ring-2 ring-border/30 hover:brightness-125 text-foreground/70 hover:text-accent transition-all duration-300">
            <Filter size={17} className="pointer-events-none"/>
          </button>
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
            onChange={(e) => {
              const value = e.target.value;
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

        <AnimatePresence mode="wait">
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="search-contents w-full h-100 relative border border-border/30 bg-grain3 rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto z-99 shadow-lg shadow-black/10"
            >
              <AnimatePresence>
                {searchTerm ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {/* Map search results here */}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-3 py-10"
                  >
                    <SearchAlert className="text-3xl" />
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
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
