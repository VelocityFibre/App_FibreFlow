import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export const metadata = {
  title: 'Your App with FibreFlow Theme',
  description: 'App with FibreFlow theme integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme script to prevent FOUC (Flash of Unstyled Content) */}
        <script src="/theme.js" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="fibreflow"
          themes={['light', 'dark', 'fibreflow']}
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}