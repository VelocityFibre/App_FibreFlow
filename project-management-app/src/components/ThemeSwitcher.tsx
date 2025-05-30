"use client";

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon, FiMonitor, FiWifi } from 'react-icons/fi';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder to prevent hydration mismatch
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const themeOptions = [
    {
      id: 'light',
      name: 'Light',
      icon: <FiSun className="w-4 h-4" />,
      description: 'Standard light theme'
    },
    {
      id: 'dark', 
      name: 'Dark',
      icon: <FiMoon className="w-4 h-4" />,
      description: 'Next.js standard dark theme'
    },
    {
      id: 'fibreflow',
      name: 'FibreFlow',
      icon: <FiWifi className="w-4 h-4" />,
      description: 'Custom FibreFlow branding'
    }
  ];

  return (
    <div className="relative group">
      {/* Current theme button */}
      <button
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        title={`Current theme: ${theme}`}
      >
        {themeOptions.find(option => option.id === theme)?.icon || <FiMonitor className="w-4 h-4" />}
        <span className="hidden sm:inline">
          {themeOptions.find(option => option.id === theme)?.name || 'Theme'}
        </span>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Select Theme
          </div>
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                theme === option.id 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <span className={`${theme === option.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {option.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium">{option.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
              {theme === option.id && (
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* System theme option */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-2">
          <button
            onClick={() => setTheme('system')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              theme === 'system' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            <FiMonitor className={`w-4 h-4 ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            <div className="flex-1">
              <div className="font-medium">System</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Use system preference
              </div>
            </div>
            {theme === 'system' && (
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}