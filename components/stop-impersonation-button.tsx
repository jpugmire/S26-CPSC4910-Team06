"use client"

import { useSession } from "next-auth/react"

export function StopImpersonationButton() {
  const { update } = useSession()

  async function handleStop() {
    const res = await fetch("/api/admin/impersonation/stop", {
      method: "POST",
    })
    console.log("click!!!");

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

    window.location.href = "/dashboard"
  }

  return (
  <button
    onClick={handleStop}
    style={{ background: "red", color: "white", padding: "10px", cursor: "pointer" }}
  >
    Stop impersonating
  </button>
)
}