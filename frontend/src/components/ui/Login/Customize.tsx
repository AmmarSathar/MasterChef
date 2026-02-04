import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Badge } from "@components/ui/badge";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";

import { EggFriedIcon, CitrusIcon } from "lucide-react";

import { User } from "@masterchef/shared/types/user";

interface CustomizeProps {
  ready: boolean;
}

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

export default function Customize({ ready }: CustomizeProps) {
  const [headerTransitioned, setHeaderTransitioned] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [allergies, setAllergies] = useState("");
  const [partialUser, setPartialUser] = useState<User>({} as User);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setPartialUser(JSON.parse(storedUser));
    }
  }, [partialUser]);

  useEffect(() => {
    if (ready) {
      setTimeout(() => {
        setHeaderTransitioned(true);
      }, 600);
    }
  }, [ready]);

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

  const handleFormComplete = async (formData: FormData) => {
    if (selectedCuisines.length === 0) {
      toast.error("Please select at least one favorite cuisine");
      return;
    }

    const loadingToast = toast.loading("Setting up your profile...");
    setPartialUser((prev) => ({
      ...prev,
      dietaryRestrictions: selectedDietary,
      allergies: allergies.split(",").map((a) => a.trim()),
      skillLevel,
      favoriteCuisines: selectedCuisines,
    }));

    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Profile customization complete!\nLet's start cooking!");
      // navigate to main app later
    }, 1000);
  };

  return (
    <div
      className="w-full h-full p-10 pl-50 max-md:p-0 max-md:pb-5 max-md:m-0 flex flex-col overflow-y-scroll overflow-x-hidden max-md:scroll-m-5 noScrollbar md:showScrollbar"
      style={
        {
          // msOverflowStyle: "none",
          // scrollbarWidth: "none",
        }
      }
    >
      <div
        className={`customize-stepper max-md:w-full max-md:h-20 max-md:p-5 relative flex items-center justify-center transition-all duration-500 delay-500 ease-out mb-5 ${headerTransitioned ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
      >
        <Stepper defaultValue={0} className="">
          <StepperNav>
            {["Culinary Preferences", "Profile Customization", "Friends"].map(
              (step, index) => (
                <StepperItem key={step} step={index + 1}>
                  <StepperTrigger>
                    <StepperIndicator>{index}</StepperIndicator>
                  </StepperTrigger>
                  {index <
                    ["Culinary Preferences", "Profile Customization", "Friends"]
                      .length -
                      1 && (
                    <StepperSeparator className="group-data-[state=completed]/step:bg-primary" />
                  )}
                </StepperItem>
              ),
            )}
          </StepperNav>

          <StepperPanel className="text-sm">
            {["Culinary Preferences", "Profile Customization", "Friends"].map(
              (step, index) => (
                <StepperContent
                  key={step}
                  value={index}
                  className="flex items-center justify-center"
                >
                  {step}
                </StepperContent>
              ),
            )}
          </StepperPanel>
        </Stepper>
      </div>

      <div
        className={`transition-all duration-700 ease-out ${
          headerTransitioned
            ? "text-left mb-8"
            : "text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}
      >
        <div className="typewriter mb-4 w-full transition-all duration-500 relative">
          <h1 className={`${headerTransitioned ? "hideBar" : ""} text-4xl font-bold text-foreground w-full transition-all duration-500`}>
            Customize Your Culinary Experience
          </h1>
          <EggFriedIcon
            size={70}
            className={`absolute -right-10 -bottom-25 max-md:opacity-10 max-md:z-100 opacity-0 -translate-y-5 transition-all duration-500 delay-700 ease-out ${headerTransitioned ? "opacity-70 translate-y-0" : ""}`}
            color="#FDB813"
          />
        </div>
        <p className={`text-muted-foreground transition-all duration-400 ${ready ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}>
          Personalize your cooking journey
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFormComplete(e);
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
          Complete Setup
        </button>
      </form>
    </div>
  );
}
