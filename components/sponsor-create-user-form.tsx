"use client"

import { useState } from "react"

export function SponsorCreateUserForm() {
  const [success, setSuccess] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setRole] = useState("D")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, userType }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create user")
      } else {
        setSuccess("User created successfully!")
        setTimeout(() => setSuccess(""), 3000)
        setUsername("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setRole("D")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 rounded-md"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={userType}
          onChange={(e) => setRole(e.target.value)}
          className={inputClass}
        >
          <option value="D">Driver</option>
          <option value="S">Sponsor</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          User will be created under your organization.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating..." : "Create User"}
      </button>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </form>
  )
}
