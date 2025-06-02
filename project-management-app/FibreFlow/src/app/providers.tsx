'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      themes={['light', 'dark', 'vf']}
      enableSystem={false}
      storageKey="fibreflow-theme"
    >
      {children}
    </ThemeProvider>
  );
}