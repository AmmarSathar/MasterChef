import { useState, useRef, useEffect } from "react";
import { Label } from "@components/ui/label";
import { Badge } from "@components/ui/badge";
import {
  EggFriedIcon,
  CitrusIcon,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";
import {
  allergenOptions,
  dietaryOptions,
  cuisineOptions,
  SKILL_LEVELS,
} from "@masterchef/shared/constants";

interface CustomizeStep1Props {
  onNext: (data: {
    dietaryRestrictions: string[];
    allergies: string[];
    skillLevel: string;
    favoriteCuisines: string[];
  }) => void;
  initialData?: {
    dietaryRestrictions: string[];
    allergies: string[];
    skillLevel: string;
    favoriteCuisines: string[];
  };
  headerTransitioned: boolean;
}

export default function CustomizeStep1({
  onNext,
  initialData,
  headerTransitioned,
}: CustomizeStep1Props) {
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    initialData?.dietaryRestrictions || [],
  );
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    initialData?.favoriteCuisines || [],
  );
  const [skillLevel, setSkillLevel] = useState(initialData?.skillLevel || "");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    initialData?.allergies || [],
  );
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);
  const [allergySearch, setAllergySearch] = useState("");
  const allergyDropdownRef = useRef<HTMLDivElement>(null);
  const allergySearchRef = useRef<HTMLInputElement>(null);

  const filteredAllergyOptions = allergenOptions.filter((option) =>
    option.toLowerCase().includes(allergySearch.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        allergyDropdownRef.current &&
        !allergyDropdownRef.current.contains(e.target as Node)
      ) {
        setAllergyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDietary = (option: string) => {
    setSelectedDietary((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const toggleAllergy = (option: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const toggleCuisine = (option: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const handleSubmit = () => {
    // console.log(selectedDietary, allergies, skillLevel, selectedCuisines);
    onNext({
      dietaryRestrictions: selectedDietary,
      allergies: selectedAllergies,
      skillLevel,
      favoriteCuisines: selectedCuisines,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className={`transition-all duration-700 ease-out w-full flex flex-col gap-8 max-md:no-scrollbar ${
        headerTransitioned
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
    >
      <div className="w-full">
        <Label className="text-lg font-bold text-foreground mb-4 block">
          Dietary Restrictions & Preferences
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select any that apply to you (optional)
        </p>
        <div className="flex flex-wrap gap-3">
          {dietaryOptions.map((option) => (
            <Badge
              key={option}
              onClick={() => toggleDietary(option)}
              className={`cursor-pointer px-4 py-2 transition-all ${
                selectedDietary.includes(option)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
              }`}
            >
              {option}
            </Badge>
          ))}
        </div>
      </div>

      <div className="w-full" ref={allergyDropdownRef}>
        <Label className="text-lg font-bold text-foreground mb-4 block">
          Allergies
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select any food allergies that apply (optional)
        </p>
        <div className="relative">
          <div
            onClick={() => {
              setAllergyDropdownOpen(true);
              setTimeout(() => allergySearchRef.current?.focus(), 0);
            }}
            className="w-full h-13 rounded-full bg-input/80 border border-border/60 shadow-sm shadow-border/80 px-5 flex items-center gap-3 cursor-text hover:border-primary/50 transition-all"
          >
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              ref={allergySearchRef}
              type="text"
              placeholder={
                selectedAllergies.length === 0
                  ? "Search allergies..."
                  : `${selectedAllergies.length} selected — search more...`
              }
              value={allergySearch}
              onChange={(e) => {
                setAllergySearch(e.target.value);
                setAllergyDropdownOpen(true);
              }}
              onKeyDown={(event) => {
                const key = event.key;
                setAllergyDropdownOpen(key === "escape");
              }}
              onBlur={() => setAllergyDropdownOpen(false)}
              onFocus={() => setAllergyDropdownOpen(true)}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <ChevronDown
              size={18}
              className={`text-muted-foreground shrink-0 transition-transform duration-200 ${allergyDropdownOpen ? "rotate-180" : ""}`}
            />
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
                    onClick={() => toggleAllergy(option)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        selectedAllergies.includes(option)
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedAllergies.includes(option) && (
                        <Check size={12} className="text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{option}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {selectedAllergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedAllergies.map((allergy) => (
              <Badge
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className="cursor-pointer px-3 py-1 bg-primary text-primary-foreground border-primary hover:opacity-80 transition-all"
              >
                {allergy} x
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <Label className="text-lg font-bold text-foreground mb-4 block">
          Cooking Skill Level
        </Label>

        <div className="flex gap-3 w-full relative">
          {SKILL_LEVELS.map(({ label, value }) => (
            <Badge
              key={value}
              onClick={() => setSkillLevel(value)}
              className={`cursor-pointer px-4 py-2 flex-1 text-center transition-all ${
                skillLevel === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
              }`}
            >
              {label}
            </Badge>
          ))}
          <CitrusIcon
            size={70}
            className={`absolute -right-10 -bottom-25 max-md:opacity-10 max-md:z-100 opacity-0 -translate-y-5 transition-all duration-500 delay-1000 ease-out ${headerTransitioned ? "opacity-70 translate-y-0" : ""}`}
            color="#9ACD32"
          />
        </div>
      </div>

      <div className="w-full">
        <Label className="text-lg font-bold text-foreground mb-4 block">
          Favorite Cuisines <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select at least one cuisine you enjoy
        </p>
        <div className="flex flex-wrap gap-3">
          {cuisineOptions.map((cuisine) => (
            <Badge
              key={cuisine}
              onClick={() => toggleCuisine(cuisine)}
              className={`cursor-pointer px-4 py-2 transition-all ${
                selectedCuisines.includes(cuisine)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
              }`}
            >
              {cuisine}
            </Badge>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-13 bg-primary/90 text-accent font-bold rounded-full shadow-sm shadow-primary/50 hover:shadow-primary/90 hover:opacity-90 cursor-pointer transition-all duration-200 mt-4"
      >
        Next: Personal Details
      </button>
    </form>
  );
}
