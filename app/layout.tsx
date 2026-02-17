import "./globals.css"
import { SessionProvider } from "@/components/session-provider"

export const metadata = {
  title: 'Driver Rewards System',
  description: 'Logistics Sponser / User point tracking and rewards system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
