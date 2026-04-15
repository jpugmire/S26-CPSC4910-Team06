"use client"

import { useSession } from "next-auth/react"

export function StopImpersonationButton() {
  const { data: session, update } = useSession()

  async function handleStop() {
    if (!session?.user?.realUserRole) return

    const endpoint =
      session.user.realUserRole === "A"
        ? "/api/admin/impersonation/stop"
        : "/api/sponsor/impersonation/stop"

    const res = await fetch(endpoint, { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error ?? "Failed to stop impersonation.")
      return
    }

    await update({ impersonationAction: { type: "stop" } })
    window.location.href = "/dashboard"
  }

  return (
    <button
      onClick={handleStop}
      className="text-sm font-medium px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
    >
      Stop Impersonating
    </button>
  )
}
