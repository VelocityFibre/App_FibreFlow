"use client";

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    // Check if dark mode is active
    const darkModeActive = document.documentElement.classList.contains('dark');
    setIsDark(darkModeActive);
  }, []);

  // Simple toggle function that directly manipulates the DOM
  function toggleTheme() {
    if (isDark) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  }

  return (
    <button
      aria-label="Toggle theme"
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon for dark mode (clicking switches to light)
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9-9h-2.25M3 12H5.25m12.02 6.02l-1.591-1.591m-8.486 0l-1.591 1.591m12.02-12.02l-1.591 1.591m-8.486 0l-1.591-1.591" />
        </svg>
      ) : (
        // Moon icon for light mode (clicking switches to dark)
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      )}
    </button>
  );
}
