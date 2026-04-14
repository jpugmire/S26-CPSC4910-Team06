"use client"

import { useEffect, useState } from "react"
import Link from "next/link";

const PAGE_SIZE = 10

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1 mt-3">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-2 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-700"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded border text-sm ${p === page ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100 dark:hover:bg-zinc-700"}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-2 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-700"
      >
        →
      </button>
    </div>
  )
}

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userPage, setUserPage] = useState(1)
  const [sponsorPage, setSponsorPage] = useState(1)

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

  const pagedUsers = users.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE)
  const pagedSponsors = sponsors.slice((sponsorPage - 1) * PAGE_SIZE, sponsorPage * PAGE_SIZE)

  return (
    <div className="overflow-x-auto space-y-4">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Type</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((user) => (
              <tr key={user.User_ID} className="text-center">
                <td className="px-4 py-2 border text-blue-600 hover:underline">
                  <Link href={`/account/${user.User_ID}`}>{user.User_ID}</Link>
                </td>
                <td className="px-4 py-2 border">{user.Username}</td>
                <td className="px-4 py-2 border">{user.Status}</td>
                <td className="px-4 py-2 border">{user.User_Type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={userPage} total={users.length} onChange={setUserPage} />
      </div>

      <div>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Sponsor Name</th>
            </tr>
          </thead>
          <tbody>
            {pagedSponsors.map((sponsor) => (
              <tr key={sponsor.Org_ID} className="text-center">
                <td className="px-4 py-2 border">{sponsor.Org_ID}</td>
                <td className="px-4 py-2 border">{sponsor.Org_Name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={sponsorPage} total={sponsors.length} onChange={setSponsorPage} />
      </div>
    </div>
  )
}
