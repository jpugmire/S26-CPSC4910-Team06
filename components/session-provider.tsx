"use client"

import { SessionProvider as Provider } from "next-auth/react"
import { ThemeProvider } from "next-themes"

export function SessionProvider({ children }: { children: React.ReactNode }) {
    return (
    <Provider>{children}</Provider>
    )
}