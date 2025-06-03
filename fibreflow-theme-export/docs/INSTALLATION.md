# FibreFlow Theme Installation Guide

## Overview
This package contains all the necessary files to implement the FibreFlow theme in your Next.js application.

## Files Included
```
fibreflow-theme-export/
├── src/
│   ├── app/
│   │   ├── globals.css      # Main CSS with theme variables
│   │   └── theme.js         # App-level theme configuration
│   └── components/
│       ├── ThemeProvider.tsx # Theme provider wrapper
│       ├── ThemeSwitcher.tsx # Theme selection component
│       └── ThemeToggle.tsx   # Dark/light toggle button
├── public/
│   └── theme.js             # Client-side theme script
├── tailwind.config.js       # Tailwind configuration
└── docs/
    ├── INSTALLATION.md      # This file
    ├── package.json         # Dependencies needed
    └── layout-example.tsx   # Example layout implementation
```

## Installation Steps

### 1. Install Dependencies
```bash
npm install next-themes
```

### 2. Copy Files to Your Project
Copy the following files to your Next.js project:

```bash
# Copy CSS and theme files
cp src/app/globals.css your-project/src/app/
cp src/app/theme.js your-project/src/app/
cp public/theme.js your-project/public/

# Copy components
cp src/components/* your-project/src/components/

# Copy or merge Tailwind config
cp tailwind.config.js your-project/
```

### 3. Update Your Root Layout
Replace or update your `src/app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/theme.js" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 4. Add Theme Switching to Your UI
Use the provided components:

```tsx
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'

function Header() {
  return (
    <header>
      <ThemeSwitcher /> {/* Dropdown with all themes */}
      <ThemeToggle />   {/* Simple dark/light toggle */}
    </header>
  )
}
```

### 5. Use Theme in Components
```tsx
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="bg-background text-foreground">
      <button onClick={() => setTheme('fibreflow')}>
        Use FibreFlow Theme
      </button>
    </div>
  )
}
```

## Available Themes
- `light` - Light theme
- `dark` - Dark theme  
- `fibreflow` - Custom FibreFlow theme with brand colors
- `system` - Follow system preference

## Theme Variables
The FibreFlow theme uses these primary colors:
- Background: `#003049` (Dark blue)
- Primary: `#3B82F6` (Blue)
- Secondary: `#1E293B` (Slate)

All colors are defined as CSS variables in `globals.css` for easy customization.

## Troubleshooting
- Ensure `suppressHydrationWarning` is added to `<html>` tag
- Include the theme script in `<head>` to prevent FOUC (Flash of Unstyled Content)
- Check that CSS variables are properly mapped in Tailwind config