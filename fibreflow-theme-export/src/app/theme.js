// Check if theme exists in localStorage
try {
  // Add a class to indicate theme is initializing
  document.documentElement.classList.add('theme-initializing');
  
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme based on localStorage or system preference
  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Remove initializing class after a short delay
  setTimeout(() => {
    document.documentElement.classList.remove('theme-initializing');
  }, 50);
} catch (e) {
  // Silently fail if localStorage is not available
  document.documentElement.classList.remove('theme-initializing');
}
