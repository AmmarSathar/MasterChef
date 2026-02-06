import React from "react";

import { ThemeToggle } from "@/components/theme-toggle";

import "./styles.css";

export default function Navbar() {
  const [selectedBtn, setSelectedBtn] = React.useState<number | null>(null);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="md:h-full w-33 max-md:w-screen max-md:hidden max-md:h-10 flex absolute max-md:left-0 max-md:my-10 max-md:mx-0 items-center justify-center p-5 m-0 bg-background text-foreground border-b border-border z-50">
      <div className="w-full h-full max-w-7xl flex flex-col md:flex-col max-md:flex-row items-center p-3 m-0 rounded-2xl max-md:justify-between">
        {/* Logo Section */}
        <div className="flex flex-col md:flex-col max-md:flex-row gap-6 w-full h-full items-center justify-center rounded-lg">
          <i className="w-12 h-12 bg-white/15 backdrop-blur-sm shadow-[0_4px_24px_0_rgba(165,165,165,0.37)] rounded-xl border border-white/18 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] cursor-pointer"></i>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col md:flex-col max-md:flex-row gap-6 w-full h-full items-center justify-center rounded-lg">
          {[0, 1, 2, 3].map((idx) => (
        <button
          key={idx}
          className={`w-12 h-12 bg-white/15 backdrop-blur-sm shadow-[0_4px_24px_0_rgba(165,165,165,0.37)] rounded-xl border border-white/18 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] cursor-pointer origin-center ${
            selectedBtn === idx
          ? "h-[3.4rem] bg-linear-to-br from-[#ff9800] to-[#ffb347] shadow-[0_4px_24px_0_rgba(255,152,0,0.37),0_2px_8px_0_rgba(255,179,71,0.25)]"
          : ""
          }`}
          onClick={() => setSelectedBtn(idx)}
        />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-col max-md:flex-row gap-6 w-full h-full items-center justify-center rounded-lg">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="w-12 h-12 bg-white/15 backdrop-blur-sm shadow-[0_4px_24px_0_rgba(165,165,165,0.37)] rounded-xl border border-white/[0.18] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] cursor-pointer text-xs font-bold text-foreground/80 hover:text-foreground"
            aria-label="Logout"
            title="Logout"
          >
            Logout
          </button>

          <i className="w-12 h-12 bg-white/15 backdrop-blur-sm shadow-[0_4px_24px_0_rgba(165,165,165,0.37)] rounded-xl border border-white/[0.18] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] cursor-pointer"></i>
        </div>
      </div>
    </nav>
  );
}
