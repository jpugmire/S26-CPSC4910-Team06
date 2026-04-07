"use client"

import { useSession } from "next-auth/react"
import { StopImpersonationButton } from "@/components/stop-impersonation-button"

export default function ImpersonationBanner() {
  const { data: session, status } = useSession();

  const userId = session?.user?.id

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Impersonating: {session?.user.username}</h1>
          <StopImpersonationButton />
        </div>
      </div>
    </nav>
  )
}

