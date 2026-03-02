"use client"

import { useEffect, useState } from "react"

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

    const fetchSponsors = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await fetch("/api/admin/sponsors")
        const data = await res.json()

        if (!res.ok) setError(data.error || "Failed to fetch sponsors")
        else setSponsors(data.sponsorOrgs ?? [])
      } catch {
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    fetchSponsors()
  }, [])

  return (
    <div className="mt-6 overflow-x-auto">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Username</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.User_ID} className="text-center">
              <td className="px-4 py-2 border">{user.User_ID}</td>
              <td className="px-4 py-2 border">{user.Username}</td>
              <td className="px-4 py-2 border">{user.Status}</td>
              <td className="px-4 py-2 border">{user.User_Type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Sponsor Name</th>
          </tr>
        </thead>
        <tbody>
          {sponsors.map((sponsor) => (
            <tr key={sponsor.Org_ID} className="text-center">
              <td className="px-4 py-2 border">{sponsor.Org_ID}</td>
              <td className="px-4 py-2 border">{sponsor.Org_Name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
