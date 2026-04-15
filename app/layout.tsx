import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { Providers } from "@/components/theme-provider"

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "Driver Rewards System",
  description: "Logistics Sponsor / User point tracking and rewards system",
  openGraph: {
    title: "Driver Rewards System",
    description: "Logistics Sponsor / User point tracking and rewards system",
    type: "website",
    siteName: "Driver Rewards System",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Driver Rewards System",
    description: "Logistics Sponsor / User point tracking and rewards system",
    images: ["/opengraph-image.png"],
  },
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