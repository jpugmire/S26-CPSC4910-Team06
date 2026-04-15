"use client"

import { useState } from "react"

export function CreateSponsorForm() {
  const [success, setSuccess] = useState("")
  const [Org_Name, setOrgName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/createSponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Org_Name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create sponsor organization")
      } else {
        setSuccess("Sponsor organization created successfully!")
        setTimeout(() => setSuccess(""), 3000)
        setOrgName("")
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
        <label className="block text-sm font-medium mb-1">Sponsor Organization Name</label>
        <input
          type="text"
          value={Org_Name}
          onChange={(e) => setOrgName(e.target.value)}
          required
          className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 rounded-md"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating..." : "Create Sponsor Organization"}
      </button>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </form>
  )
}
