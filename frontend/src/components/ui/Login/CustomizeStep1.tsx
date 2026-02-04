import { useState } from "react";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Badge } from "@components/ui/badge";
import { EggFriedIcon, CitrusIcon } from "lucide-react";

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
];

const cuisineOptions = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "Thai",
  "French",
  "Mediterranean",
  "American",
  "Korean",
];

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

interface CustomizeStep1Props {
  onNext: (data: {
    dietaryRestrictions: string[];
    allergies: string;
    skillLevel: string;
    favoriteCuisines: string[];
  }) => void;
  initialData?: {
    dietaryRestrictions: string[];
    allergies: string;
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
  const [allergies, setAllergies] = useState(initialData?.allergies || "");

  const toggleDietary = (option: string) => {
    setSelectedDietary((prev) =>
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

  const handleSubmit = (formData: FormData) => {
    // console.log(selectedDietary, allergies, skillLevel, selectedCuisines);
    onNext({
      dietaryRestrictions: selectedDietary,
      allergies,
      skillLevel,
      favoriteCuisines: selectedCuisines,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
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

      <div className="w-full">
        <Label
          htmlFor="allergies"
          className="text-lg font-bold text-foreground mb-4 block"
        >
          Allergies
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          List any food allergies (comma-separated)
        </p>
        <Input
          id="allergies"
          name="allergies"
          placeholder="e.g. Peanuts, Shellfish, Eggs"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          className="w-full h-13 rounded-full bg-input/80 border-border/60 shadow-sm shadow-border/80 px-5"
        />
      </div>

      <div className="w-full">
        <Label className="text-lg font-bold text-foreground mb-4 block">
          Cooking Skill Level
        </Label>

        <div className="flex gap-3 w-full relative">
          {skillLevels.map((level) => (
            <Badge
              key={level}
              onClick={() => setSkillLevel(level)}
              className={`cursor-pointer px-4 py-2 flex-1 text-center transition-all ${
                skillLevel === level
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
              }`}
            >
              {level}
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
