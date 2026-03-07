"use client"

import Link from "next/link";
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/logout-button"

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Driver Rewards Dashboard</h1>
          <h3 className="text-md">Welcome, {status === "loading" ? "..." : session?.user?.username}</h3>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          <Link href="/about" className="text-sm text-blue-600 hover:underline">About</Link>
          <Link href="/account" className="text-sm text-blue-600 hover:underline">Account</Link>
          {session?.user?.role === "A" && (<Link href="/adminConsole" className="text-sm text-red-600 font-semibold hover:underline">Admin Console</Link>)}
          {session?.user?.role === "S" && (<Link href="/sponsor/catalog" className="text-sm text-green-600 font-semibold hover:underline">My Catalog</Link>)}
          {session?.user?.role === "S" && (<Link href="/sponsorConsole" className="text-sm text-red-600 font-semibold hover:underline">Sponsor Console</Link>)}
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

