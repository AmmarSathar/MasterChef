import React from "react";
import {
  Utensils,
  LayoutGrid,
  Bookmark,
  FileText,
  Tv,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import "./styles.css";

const NAV_ITEMS = [
  { id: 1, icon: LayoutGrid },
  { id: 2, icon: Bookmark },
  { id: 3, icon: FileText },
  { id: 4, icon: Tv },
  { id: 5, icon: BarChart3 },
];

export default function Navbar() {
  const [selectedBtn, setSelectedBtn] = React.useState<number>(1);

  return (
    <div className="navbar-parent-container w-screen h-screen flex items-center justify-baseline pointer-events-none absolute top-0 left-0">
      <nav className="md:h-full w-30 max-md:w-screen max-md:hidden max-md:h-10 flex relative max-md:left-0 max-md:my-10 max-md:mx-0 items-center pointer-events-auto justify-center p-3 m-0 text-foreground z-50">
        <div className="w-full h-full py-8 p-4 pointer-events-auto transition-all duration-400 delay-100 ease-out bg-card/70 hover:bg-card rounded-3xl flex flex-col items-center justify-between gap-3 relative shadow-xl border border-border">
          <div className="flex flex-col items-center gap-3 z-20">
            <div className="flex w-13 h-13 bg-secondary items-center justify-center rounded-full shadow-lg shadow-secondary/30">
              <Utensils className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 flex-1 justify-center z-20">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedBtn(item.id)}
                  className={`flex w-12 h-12 items-center justify-center cursor-pointer ${selectedBtn === item.id ? "h-15" : ""} rounded-xl transition-all duration-300 ${
                    selectedBtn === item.id
                      ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 delay-100 pointer-events-none ${selectedBtn === item.id ? "text-primary-foreground mb-3" : "text-muted-foreground"}`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3 z-20">
            <button
              onClick={() => setSelectedBtn(6)}
              className={`flex w-12 h-12 items-center justify-center rounded-xl transition-all duration-300 ${
                selectedBtn === 6
                  ? "bg-linear-to-br from-brand-primary to-primary shadow-lg shadow-primary/30"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              <Settings
                className={`w-6 h-6 pointer-events-none ${selectedBtn === 6 ? "text-primary-foreground" : "text-muted-foreground"}`}
              />
            </button>
            <div className="flex w-12 h-12 items-center justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
