// components/theme-toggle.tsx
"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-sm font-medium py-2 px-4 rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
    >
      {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  )
}