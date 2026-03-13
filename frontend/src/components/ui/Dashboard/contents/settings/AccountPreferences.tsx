import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useUser } from "@context/UserContext";

import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ConfirmChanges from "./ConfirmChanges";

import {
  allergenOptions,
  dietaryOptions,
  cuisineOptions,
  SKILL_LEVELS,
} from "@masterchef/shared/constants";
import {
  Scale,
  Salad,
  AlertTriangle,
  ChefHat,
  Globe,
  X,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";

export default function AccountPreferences() {
  const { user, setUser, loading } = useUser();

  const [weight, setWeight] = useState(user?.weight);
  const [height, setHeight] = useState(user?.height);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    user?.dietary_restric || [],
  );
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);
  const [allergySearch, setAllergySearch] = useState("");
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);
  const allergyDropdownRef = useRef<HTMLDivElement>(null);
  const allergySearchRef = useRef<HTMLInputElement>(null);
  const [skillLevel, setSkillLevel] = useState<
    typeof SKILL_LEVELS[number]["value"]
  >(user?.skill_level || SKILL_LEVELS[0].value);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(
    user?.cuisines_pref || [],
  );
  const [showConfirm, showConfirmChanges] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

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

  useEffect(() => {
    if (loading) {
      console.log("Loading user data...");
      return;
    }

    if (!user) {
      toast.error("User could not be initialized, please reload");
      setFormDisabled(true);
      return;
    }

    console.log(user.weight, user.height);

    if (
      weight !== user.weight ||
      height !== user.height ||
      JSON.stringify(dietaryRestrictions) !==
        JSON.stringify(user.dietary_restric) ||
      JSON.stringify(allergies) !== JSON.stringify(user.allergies) ||
      skillLevel !== user.skill_level ||
      JSON.stringify(cuisinePreferences) !== JSON.stringify(user.cuisines_pref)
    ) {
      showConfirmChanges(true);
    } else {
      showConfirmChanges(false);
    }
  }, [
    weight,
    height,
    dietaryRestrictions,
    allergies,
    skillLevel,
    cuisinePreferences,
    user,
    loading,
  ]);

  const onSettingsSubmit = async () => {
    setFormDisabled(true);

    const loadingToast = toast.loading("Saving changes...");

    const profilePayload = {
      userId: user?.id,
      weight: weight || undefined,
      height: height || undefined,
      dietary_restric: dietaryRestrictions,
      allergies: allergies,
      skill_level: skillLevel || undefined,
      cuisines_pref: cuisinePreferences,
      isCustomized: true,
    };

    try {
      const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
      const res = await axios.put(
        `${BASE_API_URL}/user/profile`,
        profilePayload,
        { withCredentials: true },
      );
      const updatedUser = res.data.user;

      setUser(updatedUser);

      toast.dismiss(loadingToast);
      toast.success("Successfully saved\nLet's start cooking!");

      setTimeout(() => {
        if (window.location.hash === "#settings") {
          window.location.hash = "main";
          setTimeout(() => (window.location.hash = "#settings"), 300);
        } else {
          window.location.hash = "#settings";
        }
      }, 200);

      setFormDisabled(false);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(err)) {
        const message =
          err?.response?.data?.message ||
          "Failed to save profile. Please try again.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      setFormDisabled(false);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction],
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy],
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setCuisinePreferences((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine],
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log(
          "Data to parse: ",
          weight,
          height,
          dietaryRestrictions,
          allergies,
          skillLevel,
          cuisinePreferences,
          "\n\n Into: ",
          user,
        );

        onSettingsSubmit();
      }}
      onReset={() => {
        showConfirmChanges(false);
        setAllergies(user?.allergies || []);
        setDietaryRestrictions(user?.dietary_restric || []);
        setHeight(user?.height || 0);
        setWeight(user?.weight || 0);
        setSkillLevel(user?.skill_level || "beginner");
        setCuisinePreferences(user?.cuisines_pref || []);
      }}
      className="account-preferences w-full h-auto flex flex-col gap-10 items-center justify-start p-5 py-6 relative"
    >
      <div className="option-group w-full py-3 flex flex-col gap-8 px-3">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-1">
            <label className="pointer-events-none select-none text-xl text-left font-bold text-accent">
              Dietary Preferences
            </label>
            <p className="text-muted-foreground text-sm">
              Customize your culinary profile and get a personalized experience
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Scale size={20} className="text-accent/80" />
            <label className="text-foreground/80 text-base font-semibold">
              Physical Stats
            </label>
          </div>
        </div>

        <div className="physical-stats flex flex-col gap-4">
          <div className="flex gap-6 w-full">
            <div className="flex flex-col gap-3 w-full relative">
              <label className="pointer-events-none select-none text-sm ml-1 text-left font-semibold tracking-wide text-foreground/80">
                Current Weight (kg)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  name="weight"
                  disabled={formDisabled}
                  onChange={(event) => {
                    const value = event.target.value;
                    setWeight(Number(value) || 0);
                  }}
                  placeholder={
                    user?.weight ? user?.weight.toString() : "Unspecified"
                  }
                  min="20"
                  max="500"
                  step="0.1"
                  className="bg-input/80 rounded-xl px-4 py-1 h-14 w-full"
                />
                <span className="absolute right-15 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold pointer-events-none">
                  KG
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full relative">
              <label className="pointer-events-none select-none text-sm ml-1 text-left font-semibold tracking-wide text-foreground/80">
                Height (cm)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  name="height"
                  disabled={formDisabled}
                  onChange={(event) => {
                    const value = event.target.value;
                    setHeight(Number(value) || 0);
                  }}
                  placeholder={
                    user?.height ? user?.height.toString() : "Unspecified"
                  }
                  min="50"
                  max="300"
                  className="bg-input/80 rounded-xl px-4 py-1 h-14 w-full"
                />
                <span className="absolute right-15 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold pointer-events-none">
                  CM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3">
        <div className="flex items-center gap-2">
          <Salad size={20} className="text-accent/80" />
          <span className="text-foreground/80 text-base font-semibold">
            Dietary Restrictions
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {dietaryOptions.map((restriction) => (
            <button
              key={restriction}
              type="button"
              onClick={() => toggleDietaryRestriction(restriction)}
              disabled={formDisabled}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                dietaryRestrictions.includes(restriction)
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/80 hover:bg-input"
              } ${user?.dietary_restric?.includes(restriction) ? "ring-3 ring-foreground/80" : ""}`}
            >
              {restriction}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-accent/80" />
          <span className="text-foreground/80 text-base font-semibold">
            Allergies & Exclusions
          </span>
        </div>
        <div className="flex flex-col gap-4" ref={allergyDropdownRef}>
          <div className="relative">
            <div
              onClick={() => {
                setAllergyDropdownOpen(true);
                setTimeout(() => allergySearchRef.current?.focus(), 0);
              }}
              className="w-full h-14 rounded-xl bg-input/80 border border-border/60 shadow-sm shadow-border/80 px-5 flex items-center gap-3 cursor-text hover:border-accent/50 transition-all"
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

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3">
        <div className="flex items-center gap-2">
          <ChefHat size={20} className="text-accent/80" />
          <span className="text-foreground/80 text-base font-semibold">
            Cooking Skill Level
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {SKILL_LEVELS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              disabled={formDisabled}
              onClick={() => setSkillLevel(value)}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 ${
                skillLevel === value
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/60 hover:bg-input"
              } ${user?.skill_level === value ? "ring-3 ring-foreground/80" : ""}`}
            >
              <ChefHat
                size={24}
                className={skillLevel === value ? "opacity-100" : "opacity-60"}
              />
              <span className="pointer-events-none text-xs font-semibold uppercase tracking-wide">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3 pb-10">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-accent/80" />
          <span className="text-foreground/80 text-base font-semibold">
            Cuisine Preferences
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {cuisineOptions.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              disabled={formDisabled}
              onClick={() => toggleCuisine(cuisine)}
              className={`flex flex-col items-center justify-center gap-3 px-6 py-5 rounded-2xl transition-all duration-300 ${
                cuisinePreferences.includes(cuisine)
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/80 hover:bg-input"
              } ${user?.cuisines_pref?.includes(cuisine) ? "ring-3 ring-foreground/80" : ""}`}
            >
              <span className="text-sm font-semibold pointer-events-none">
                {cuisine}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, y: 0, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, y: 10, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="fixed w-full h-auto flex items-center justify-center bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-10"
          >
            <ConfirmChanges />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
