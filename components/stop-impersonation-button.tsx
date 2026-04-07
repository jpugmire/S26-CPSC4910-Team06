"use client"

import { useSession } from "next-auth/react"

export function StopImpersonationButton() {
  const { data: session } = useSession();
  const { update } = useSession()

  async function handleStop() {
    if (!session?.user?.role) return
    const endpoint =
          session.user.realUserRole === "A"
            ? "/api/admin/impersonation/stop"
            : "/api/sponsor/impersonation/stop"
    const res = await fetch(endpoint, {
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