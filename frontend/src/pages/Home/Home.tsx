import DotGrid from "@/components/DotGrid";
import { useEffect, useState } from "react";
import { ChefHat, Calendar, Utensils, Sparkles } from "lucide-react";
import Footer from "@/components/ui/footer";
import { Link } from "react-router-dom";

export default function Home() {
  const cssVar = (name: string, fallback: string) =>
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
      : fallback;

  const [colors, setColors] = useState({
    base: "#271E37",
    active: "#5227FF",
  });

  useEffect(() => {
    setColors({
      base: cssVar("--grain-color-1", "#d7c7e7"),
      active: cssVar("--grain-color-2", "#ffdab9"),
    });
    const obs = new MutationObserver(() => {
      setColors({
        base: cssVar("--grain-color-1", "#d7c7e7"),
        active: cssVar("--grain-color-2", "#ffdab9"),
      });
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={4}
          gap={20}
          baseColor={colors.base}
          activeColor={colors.active}
          proximity={100}
          shockRadius={200}
          shockStrength={4}
          resistance={800}
          returnDuration={1.2}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center max-w-lg mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              CookWise
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Cook with inspiration and follow your goal and become a MasterChef
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/login?register=true"
              className="px-5 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-full shadow-md shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 text-sm bg-card/80 backdrop-blur-sm text-foreground font-semibold rounded-full border border-border hover:bg-card transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Meal Planning</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plan your weekly meals effortlessly with smart suggestions.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Recipe Library</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Access thousands of recipes tailored to your preferences.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">AI Suggestions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get personalized recommendations based on what you have.
            </p>
          </div>
        </div>

        <Footer className="absolute bottom-10"/>
      </div>
    </div>
  );
}
