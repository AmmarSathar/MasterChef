import { useState, useEffect } from "react";
import { Paintbrush, Languages, CalendarDays, Monitor } from "lucide-react";

type ThemeValue =
  | "light"
  | "dark"
  | "dark-old"
  | "rosemary"
  | "saffron"
  | "sage"
  | "blue-apron"
  | "truffle"
  | "lavender"
  | "system";

type LangValue = "English" | "French" | "Spanish" | "Arabic" | "Chinese" | "Japanese";
type DateFormatValue = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

const THEME_OPTIONS: { label: string; value: ThemeValue; bg: string; accent: string }[] = [
  { label: "Cookwise Light", value: "light",      bg: "#f1eee8", accent: "#785976" },
  { label: "Cookwise Dark",  value: "dark",       bg: "#120f0e", accent: "#c4a484" },
  { label: "Origins Dark",   value: "dark-old",   bg: "#0e0e0e", accent: "#ffdab9" },
  { label: "Rosemary",       value: "rosemary",   bg: "#160a0b", accent: "#bf7484" },
  { label: "Saffron",        value: "saffron",    bg: "#fdf5d8", accent: "#b87010" },
  { label: "Sage",           value: "sage",       bg: "#edf6ef", accent: "#3c9a58" },
  { label: "Blue Apron",     value: "blue-apron", bg: "#090d1c", accent: "#4a84be" },
  { label: "Truffle",        value: "truffle",    bg: "#0c0c0e", accent: "#a4a4b2" },
  { label: "Lavender",       value: "lavender",   bg: "#f3eefb", accent: "#7040c0" },
  { label: "System",         value: "system",     bg: "linear-gradient(135deg, #f1eee8 50%, #120f0e 50%)", accent: "#888" },
];

const LANGUAGES: LangValue[] = ["English", "French", "Spanish", "Arabic", "Chinese", "Japanese"];
const DATE_FORMATS: DateFormatValue[] = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

function applyTheme(value: ThemeValue) {
  const resolved =
    value === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
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
    applyTheme(savedTheme);
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
          {THEME_OPTIONS.map(({ label, value, bg, accent }) => (
            <button
              key={value}
              type="button"
              onClick={() => selectTheme(value)}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-300 ${
                theme === value
                  ? "bg-accent text-card shadow-md"
                  : "bg-input/80 text-foreground/60 hover:bg-input"
              }`}
            >
              {value === "system" ? (
                <Monitor size={20} className={theme === value ? "opacity-100" : "opacity-60"} />
              ) : (
                <div className="flex gap-1.5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/10"
                    style={{ background: bg }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-white/10"
                    style={{ background: accent }}
                  />
                </div>
              )}
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
