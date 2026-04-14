import { useState, useEffect, useRef } from "react";

import { AlertTriangle, ChevronDown, Check, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { allergenOptions } from "@masterchef/shared/constants";

interface AllergiesSelectorProps {
  allergyData?: string[];
  formDisabled?: boolean;
  onChange?: (allergies: string[]) => void;
  classname?: string;
}

export default function AllergiesSelector({
  allergyData,
  formDisabled,
  classname,
  onChange,
}: AllergiesSelectorProps) {
  const [allergies, setAllergies] = useState<string[]>(allergyData || []);
  const [allergySearch, setAllergySearch] = useState("");
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);

  const allergyDropdownRef = useRef<HTMLDivElement>(null);
  const allergySearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAllergies(allergyData || []);
  }, [allergyData, allergies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        allergyDropdownRef.current &&
        !allergyDropdownRef.current.contains(event.target as Node)
      ) {
        setAllergyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredAllergyOptions = allergenOptions.filter((option) =>
    option.toLowerCase().includes(allergySearch.toLowerCase()),
  );

  const toggleAllergy = (allergy: string) => {
    const newAllergies = allergies.includes(allergy)
      ? allergies.filter((a) => a !== allergy)
      : [...allergies, allergy];
    setAllergies(newAllergies);

    onChange?.(newAllergies);
  };

  return (
    <div className="w-full flex flex-col gap-8 px-3">
      <div className="flex flex-col gap-4" ref={allergyDropdownRef}>
        <div className="relative">
          <div
            onClick={() => {
              setAllergyDropdownOpen(true);
              setTimeout(() => allergySearchRef.current?.focus(), 0);
            }}
            className={`w-full h-14 rounded-xl bg-input/80 border border-border/60 shadow-sm shadow-border/80 px-5 flex items-center gap-3 cursor-text hover:border-accent/50 transition-all ${classname}`}
          >
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              ref={allergySearchRef}
              type="text"
              disabled={formDisabled}
              placeholder={
                allergies.length === 0
                  ? "Search allergies..."
                  : `${allergies.length} selected — search more...`
              }
              value={allergySearch}
              onChange={(e) => {
                setAllergySearch(e.target.value);
                setAllergyDropdownOpen(true);
              }}
              onFocus={() => setAllergyDropdownOpen(true)}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              disabled={!allergyDropdownOpen || formDisabled}
              className="h-full px-5 absolute flex items-center justify-center top-0 right-0 pointer-events-auto z-10 cursor-pointer hover:brightness-125 transition-all duration-200"
              onClick={() => {
                if (!allergyDropdownOpen) return;

                if (allergySearchRef.current) {
                  allergySearchRef.current.disabled = true;
                  setTimeout(() => {
                    allergySearchRef.current!.disabled = false;
                    setAllergyDropdownOpen(false);
                  }, 100);
                }
                setAllergyDropdownOpen(false);
              }}
            >
              <ChevronDown
                size={18}
                className={`text-muted-foreground shrink-0 pointer-events-none transition-all duration-200 ${allergyDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          {allergyDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-2xl bg-popover border border-border shadow-lg py-2 max-h-60 overflow-y-auto">
              {filteredAllergyOptions.length === 0 ? (
                <p className="px-4 py-2.5 text-sm text-muted-foreground">
                  No allergies match your search
                </p>
              ) : (
                filteredAllergyOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={formDisabled}
                    onClick={() => toggleAllergy(option)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        allergies.includes(option)
                          ? "bg-accent border-accent"
                          : "border-border"
                      }`}
                    >
                      {allergies.includes(option) && (
                        <Check size={12} className="text-card" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{option}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <Badge
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-destructive/20 text-destructive border-destructive/30 border hover:bg-destructive/30 transition-all"
              >
                <span className="text-sm">{allergy}</span>
                <X size={14} className="text-destructive/80" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
