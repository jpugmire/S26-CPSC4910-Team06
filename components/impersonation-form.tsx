"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export function ImpersonateUserForm() {
  const router = useRouter()
  const { update } = useSession();
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState<any[]>([])
  const [User_ID, setUserID] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await fetch("/api/admin/users")
        const data = await res.json()

        if (!res.ok) setError(data.error || "Failed to fetch users")
        else setUsers(data.users ?? [])
      } catch {
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers();
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/sponsor/impersonation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: User_ID }),
      })

      console.log("Sent to API: " + User_ID)

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to start impersonation.")
        return
      }

      await update({
      impersonationAction: {
        type: "start",
        targetUserId: data.targetUser.id,
        targetRole: data.targetUser.role,
        targetUsername: data.targetUser.username,
      },
      })

      router.push("/dashboard");

    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <select
            value={User_ID ?? ""}
            onChange={(e) => setUserID(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select User</option>
            {users
            .filter((user) => user.Status === "A")
            .map((user) => (
              <option key={user.User_ID} value={user.User_ID}>
                {user.Username}
              </option>
            ))}
          </select>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md"
      >
        {loading ? "Impersonating..." : "Impersonate User"}
      </button>
      {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>)}
    </form>
  )
}
