"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
export default function Navbar() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const userId = session?.user?.id

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Driver Rewards</h1>
          <div className="flex items-center gap-1">
            {session?.user?.role === "D" && (
              <Link href="/dashboard" className="text-sm font-medium px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">Dashboard</Link>
            )}
            {session?.user?.role === "D" && (
              <Link href="/driver/apply" className="text-sm font-medium px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">Apply</Link>
            )}
            <Link href="/about" className="text-sm font-medium px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">About</Link>
            {session?.user?.role === "A" && (
              <Link href="/adminConsole" className="text-sm font-medium px-3 py-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Admin</Link>
            )}
            {session?.user?.role === "S" && (
              <Link href="/sponsor/catalog" className="text-sm font-medium px-3 py-1.5 rounded-md text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">Catalog</Link>
            )}
            {session?.user?.role === "S" && (
              <Link href="/sponsorConsole" className="text-sm font-medium px-3 py-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Console</Link>
            )}
            {session?.user?.role === "D" && (
              <Link href="/driver/catalog" className="text-sm font-medium px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">Catalog</Link>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <span className="text-sm font-medium">{session?.user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium truncate">{session?.user?.username}</p>
                  </div>
                  <Link
                    href={`/account/${userId}`}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                  {session?.user?.role === "D" && (
                    <>
                      <Link
                        href="/driver/cart"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Cart
                      </Link>
                      <Link
                        href="/driver/history"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        History
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200 dark:border-zinc-700 mt-1 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
