# FibreFlow Theme Export Guide

## Files to Copy

### 1. Core Theme Files
- `src/app/globals.css` - Contains all theme CSS variables including the FibreFlow theme
- `src/components/ThemeProvider.tsx` - Theme provider wrapper component
- `src/components/ThemeSwitcher.tsx` - Theme switching component
- `src/components/ThemeToggle.tsx` - Theme toggle button
- `tailwind.config.js` - Tailwind configuration with CSS variable support

### 2. Theme Assets
- `public/theme.js` - Client-side theme script
- `src/app/theme.js` - App-level theme configuration

## Steps to Copy Theme to Another Project

### Step 1: Install Dependencies
```bash
npm install next-themes
```

### Step 2: Copy Theme CSS Variables
Copy the FibreFlow theme section from `globals.css`:
```css
/* FibreFlow Custom Theme */
.fibreflow {
  --background: 0 48 73; /* #003049 - brand color */
  --foreground: 247 250 252;
  --card: 15 23 42;
  --card-foreground: 248 250 252;
  --popover: 15 23 42;
  --popover-foreground: 248 250 252;
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --secondary: 30 41 59;
  --secondary-foreground: 248 250 252;
  --muted: 30 41 59;
  --muted-foreground: 148 163 184;
  --accent: 30 41 59;
  --accent-foreground: 248 250 252;
  --destructive: 239 68 68;
  --destructive-foreground: 248 250 252;
  --border: 30 41 59;
  --input: 30 41 59;
  --ring: 59 130 246;
}
```

### Step 3: Update Tailwind Config
Ensure your `tailwind.config.js` includes:
```js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        // ... other color mappings
      }
    }
  }
}
```

### Step 4: Wrap App with ThemeProvider
In your app's root layout:
```tsx
import { ThemeProvider } from '@/components/ThemeProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Step 5: Add Theme to Provider
Update ThemeProvider to include 'fibreflow' in themes array:
```tsx
themes={['light', 'dark', 'fibreflow']}
```

## Quick Copy Commands

From the project root, copy all theme files:
```bash
# Create directories
mkdir -p ../your-project/src/components

# Copy theme files
cp src/app/globals.css ../your-project/src/app/
cp src/components/Theme*.tsx ../your-project/src/components/
cp tailwind.config.js ../your-project/
cp public/theme.js ../your-project/public/
cp src/app/theme.js ../your-project/src/app/
```

## Usage in Your Project
```tsx
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme('fibreflow')}>
      Use FibreFlow Theme
    </button>
  )
}
```