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
        className="px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-600 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded-md border text-sm transition-colors ${
            p === page
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-200 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-600 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
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
    <div className="space-y-6">
      {loading && <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Users table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Users</h3>
        <div className="rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {pagedUsers.map((user) => (
                <tr key={user.User_ID} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                    <Link href={`/account/${user.User_ID}`}>{user.User_ID}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.Username}</td>
                  <td className="px-4 py-3 text-sm">{user.Status}</td>
                  <td className="px-4 py-3 text-sm">{user.User_Type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={userPage} total={users.length} onChange={setUserPage} />
      </div>

      {/* Sponsors table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sponsor Organizations</h3>
        <div className="rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sponsor Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {pagedSponsors.map((sponsor) => (
                <tr key={sponsor.Org_ID} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm">{sponsor.Org_ID}</td>
                  <td className="px-4 py-3 text-sm">{sponsor.Org_Name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={sponsorPage} total={sponsors.length} onChange={setSponsorPage} />
      </div>
    </div>
  )
}
