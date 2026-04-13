"use client"

import Link from "next/link";
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const { data: session, status } = useSession();

  const userId = session?.user?.id

  return (
    <nav className="bg-white text-black shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <ThemeToggle/>
          <h1 className="text-xl font-bold">Driver Rewards Dashboard</h1>
          <h3 className="text-md">Welcome, {status === "loading" ? "..." : session?.user?.username}</h3>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          {session?.user?.role === "D" && (<Link href="/driver/apply" className="text-sm text-blue-600 hover:underline">Apply to Sponsor</Link>)}
          <Link href="/about" className="text-sm text-blue-600 hover:underline">About</Link>
          <Link href={`/account/${userId}`} className="text-sm text-blue-600 hover:underline">Account</Link>
          {session?.user?.role === "A" && (<Link href="/adminConsole" className="text-sm text-red-600 font-semibold hover:underline">Admin Console</Link>)}
          {session?.user?.role === "S" && (<Link href="/sponsor/catalog" className="text-sm text-green-600 font-semibold hover:underline">My Catalog</Link>)}
          {session?.user?.role === "S" && (<Link href="/sponsorConsole" className="text-sm text-red-600 font-semibold hover:underline">Sponsor Console</Link>)}
          {session?.user?.role === "D" && (<Link href="/driver/catalog" className="text-sm text-blue-600 hover:underline">Catalog</Link>)}
          {session?.user?.role === "D" && (<Link href="/driver/cart" className="text-sm text-blue-600 hover:underline">My Cart</Link>)}
          {session?.user?.role === "D" && (<Link href="/driver/history" className="text-sm text-blue-600 hover:underline">History</Link>)}
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

