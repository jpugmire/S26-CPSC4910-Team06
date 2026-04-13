import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { Providers } from "@/components/theme-provider"

export const metadata = {
  title: "Driver Rewards System",
  description: "Logistics Sponsor / User point tracking and rewards system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}