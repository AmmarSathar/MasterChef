import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const DARK_THEMES = new Set(['dark', 'dark-old', 'rosemary', 'blue-apron', 'truffle']);

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? DARK_THEMES.has(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 p-2 rounded-full bg-muted border border-border transition-all duration-500 ease-in-out hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className={`absolute inset-0 bg-accent transition-transform duration-500 ease-in-out ${
            isDark ? 'translate-x-0' : '-translate-x-full'
          }`}
        />
      </div>

      <div
        className={`absolute top-1 w-6 h-6 bg-background rounded-full shadow-md transition-all duration-500 ease-in-out flex items-center justify-center ${
          isDark ? 'left-5' : 'left-1'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-accent transition-all duration-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-muted-foreground transition-all duration-300" />
        )}
      </div>
    </button>
  );
}
