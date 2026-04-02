import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { CurrencyProvider } from "@/context/currency-context"
import { SettingsProvider } from "@/context/settings-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cortexio - Neural Technologies",
  description: "Professional invoice and billing management software by Cortexio Neural Technologies",
  generator: 'v0.app',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CurrencyProvider>
              <SettingsProvider>
                {children}
              </SettingsProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

