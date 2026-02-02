import React from "react";

import { ThemeToggle } from "@/components/theme-toggle";

import "./styles.css";

export default function Navbar() {
  const [selectedBtn, setSelectedBtn] = React.useState<number | null>(null);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="h-full w-33 flex absolute items-center justify-center p-5 m-0 bg-background text-foreground border-b border-border">
      <div className="w-full h-full max-w-7xl flex flex-col items-center p-3 m-0 rounded-2xl">
        <div className="navbar-logo navIconParent">
          <i className="nvIcon"></i>
        </div>

        <div className="navbar-icons navIconParent">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              className={`nvIcon ${selectedBtn === idx ? "selected" : ""}`}
              onClick={() => setSelectedBtn(idx)}
            />
          ))}
        </div>

        <div className="navbar-bottom navIconParent">
          <ThemeToggle />

          <i className="nvIcon"></i>
        </div>
      </div>
    </nav>
  );
}
