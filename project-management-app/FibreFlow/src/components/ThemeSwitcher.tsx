'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2 bg-card border border-border p-2 rounded-lg shadow-lg backdrop-blur-sm">
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-primary text-primary-foreground shadow-inner' 
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="Dark Theme"
          aria-label="Switch to dark theme"
        >
          <Moon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded transition-all duration-200 ${
            theme === 'light' 
              ? 'bg-primary text-primary-foreground shadow-inner' 
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="Light Theme"
          aria-label="Switch to light theme"
        >
          <Sun className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTheme('vf')}
          className={`p-2 rounded transition-all duration-200 ${
            theme === 'vf' 
              ? 'bg-primary text-primary-foreground shadow-inner' 
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="VF Blue Theme (For Hein)"
          aria-label="Switch to VF blue theme"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}