"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function CreateUserForm() {
  const router = useRouter()
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setRole] = useState("D")
  const [sponsorOrgId, setSponsorOrgId] = useState("")
  const [sponsorOrgs, setSponsorOrgs] = useState<any[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSponsorOrgs = async () => {
      const res = await fetch("/api/admin/sponsors")
      const data = await res.json()
      setSponsorOrgs(data)
    }
    fetchSponsorOrgs()
  }, [])


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
        body: JSON.stringify({ username, password, userType, sponsorOrgId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create user")
      } else {
        setSuccess("User created successfully!")
        setTimeout(() => setSuccess(""), 3000)
        setUsername("")
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={userType}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="A">Admin</option>
          <option value="S">Sponsor</option>
          <option value="D">Driver</option>
        </select>
      </div>

      {(userType === "S" || userType === "D") && (
        <div>
          <label className="block text-sm font-medium mb-1">Organization</label>
          <select
            value={sponsorOrgId}
            onChange={(e) => setSponsorOrgId(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select Sponsor Organization</option>
            {sponsorOrgs.map((org) => (
              <option key={org.Org_ID} value={org.Org_ID}>
                {org.Org_Name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
      >
        {loading ? "Creating..." : "Create User"}
      </button>
      {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>)}
    </form>
  )
}
