import { useState, useEffect } from "react";
import { Paintbrush, Languages, CalendarDays, Sun, Moon, Monitor } from "lucide-react";

type ThemeValue = "light" | "dark" | "system";
type LangValue = "English" | "French" | "Spanish" | "Arabic" | "Chinese" | "Japanese";
type DateFormatValue = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

const THEME_OPTIONS: { label: string; value: ThemeValue; icon: React.ReactNode }[] = [
  { label: "Light", value: "light", icon: <Sun size={22} /> },
  { label: "Dark", value: "dark", icon: <Moon size={22} /> },
  { label: "System", value: "system", icon: <Monitor size={22} /> },
];

const LANGUAGES: LangValue[] = ["English", "French", "Spanish", "Arabic", "Chinese", "Japanese"];

const DATE_FORMATS: DateFormatValue[] = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

function applyTheme(value: ThemeValue) {
  const resolved =
    value === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : value;
  document.documentElement.setAttribute("data-theme", resolved);
}

export default function AppearanceSettings() {
  const [theme, setTheme] = useState<ThemeValue>("system");
  const [lang, setLang] = useState<LangValue>("English");
  const [dateFormat, setDateFormat] = useState<DateFormatValue>("MM/DD/YYYY");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as ThemeValue | null) || "system";
    const savedLang = (localStorage.getItem("lang") as LangValue | null) || "English";
    const savedFormat = (localStorage.getItem("dateFormat") as DateFormatValue | null) || "MM/DD/YYYY";
    setTheme(savedTheme);
    setLang(savedLang);
    setDateFormat(savedFormat);
  }, []);

  const selectTheme = (value: ThemeValue) => {
    setTheme(value);
    localStorage.setItem("theme", value);
    applyTheme(value);
  };

  const selectLang = (value: LangValue) => {
    setLang(value);
    localStorage.setItem("lang", value);
  };

  const selectDateFormat = (value: DateFormatValue) => {
    setDateFormat(value);
    localStorage.setItem("dateFormat", value);
  };

  return (
    <div className="w-full h-auto flex flex-col gap-10 items-center justify-start p-5 py-6 relative">
      <div className="option-group w-full py-3 flex flex-col gap-5 px-3">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-1">
            <label className="pointer-events-none select-none text-xl text-left font-bold text-accent">
              Appearance
            </label>
            <p className="text-muted-foreground text-sm">
              Customize how MasterChef looks and feels for you
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <Paintbrush size={20} className="text-accent/80" />
            <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
              Theme
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {THEME_OPTIONS.map(({ label, value, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => selectTheme(value)}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 ${
                theme === value
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/60 hover:bg-input"
              }`}
            >
              <span className={theme === value ? "opacity-100" : "opacity-60"}>{icon}</span>
              <span className="pointer-events-none text-xs font-semibold uppercase tracking-wide">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3">
        <div className="flex gap-2 items-center">
          <Languages size={20} className="text-accent/80" />
          <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
            Language
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => selectLang(l)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                lang === l
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/80 hover:bg-input"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group w-full py-3 flex flex-col gap-8 px-3 pb-10">
        <div className="flex gap-2 items-center">
          <CalendarDays size={20} className="text-accent/80" />
          <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
            Date Format
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          {DATE_FORMATS.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => selectDateFormat(fmt)}
              className={`px-5 py-3 rounded-full text-sm font-semibold font-mono transition-all duration-300 ${
                dateFormat === fmt
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/80 hover:bg-input"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
