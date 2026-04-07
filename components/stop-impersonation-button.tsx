"use client"

import { useSession } from "next-auth/react"

export function StopImpersonationButton() {
  const { update } = useSession()

  async function handleStop() {
    const res = await fetch("/api/admin/impersonate/stop", {
      method: "POST",
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error ?? "Failed to stop impersonation.")
      return
    }

    await update({
      impersonationAction: {
        type: "stop",
      },
    })

    window.location.href = "/admin"
  }

  return <button onClick={handleStop}>Stop impersonating</button>
}