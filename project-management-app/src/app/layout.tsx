"use client";

import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from 'react-hot-toast';
import { queryClient } from "@/lib/react-query";
import { shouldUseReactQuery } from "@/lib/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

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
        <ThemeProvider>
          {/* Wrap the application with QueryClientProvider for React Query */}
          <QueryClientProvider client={queryClient}>
          <div className="w-full h-full flex">
            {/* Fixed position sidebar to ensure it's always visible */}
            <div className="fixed inset-y-0 left-0 z-20">
              <Sidebar />
            </div>
            {/* Main content with left margin to accommodate sidebar */}
            <main className="flex-1 flex flex-col min-h-screen ml-64 overflow-hidden">
              <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border z-10">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-primary">FibreFlow</span>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeSwitcher />
                </div>
              </header>
              <div className="flex-1 overflow-auto bg-muted/50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </div>
            </main>
          </div>
          {/* React Query DevTools - only shows when React Query is enabled */}
          {shouldUseReactQuery() && (
            <ReactQueryDevtools 
              initialIsOpen={false} 
              position="bottom"
            />
          )}
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
