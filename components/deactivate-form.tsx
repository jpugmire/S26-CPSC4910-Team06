"use client"

import { useEffect, useState } from "react"

export function DeactivateUserForm() {
  const [success, setSuccess] = useState("")
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
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ User_ID }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update user status")
      } else {
        setSuccess("User status updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
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
          className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 rounded-md"
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !User_ID}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Updating..." : "Deactivate User"}
      </button>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </form>
  )
}
