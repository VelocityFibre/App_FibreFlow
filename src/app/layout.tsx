"use client";

import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import { shouldUseReactQuery } from "@/lib/react-query";
import { Providers } from "./providers";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FibreFlow | Enterprise Fibre Management</title>
        <meta name="description" content="Professional fibre deployment and project management platform" />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen flex`}>
        <Providers>
          {/* Wrap the application with QueryClientProvider for React Query */}
          <QueryClientProvider client={queryClient}>
            <ThemeSwitcher />
            <div className="w-full h-full flex bg-background text-foreground">
              <Sidebar />
              <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border z-10">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground">FibreFlow</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Keep the old ThemeToggle for now, can be removed later */}
                  </div>
                </header>
                <div className="flex-1 overflow-auto bg-background">
                  <div className="max-w-7xl mx-auto px-6 py-8">
                    {children}
                  </div>
                </div>
              </main>
            </div>
            {/* React Query DevTools - only shows when React Query is enabled */}
            {shouldUseReactQuery() && (
              <ReactQueryDevtools 
                initialIsOpen={false} 
                position="bottom-right"
              />
            )}
          </QueryClientProvider>
        </Providers>
      </body>
    </html>
  );
}
