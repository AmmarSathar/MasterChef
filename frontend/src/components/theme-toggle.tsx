import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
            theme === 'dark' ? 'translate-x-0' : '-translate-x-full'
          }`}
        />
      </div>
      
      <div 
        className={`absolute top-1 w-6 h-6 bg-background rounded-full shadow-md transition-all duration-500 ease-in-out flex items-center justify-center ${
          theme === 'dark' ? 'left-5' : 'left-1'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-accent transition-all duration-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-muted-foreground transition-all duration-300" />
        )}
      </div>
    </button>
  );
}
