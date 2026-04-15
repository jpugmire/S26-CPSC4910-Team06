"use client"

import { useEffect, useState } from "react"

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
          className={`px-3 py-1 rounded-md border text-sm transition-colors ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700"}`}
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

type Affiliation = {
  User_ID: number
  Org_ID: number
  Org_Name: string
  Point_Count: number
  Driver_Username: string
  Driver_Email: string | null
}

type Driver = {
  User_ID: number
  Username: string
}

type Org = {
  Org_ID: number
  Org_Name: string
}

export function DriverAffiliationsPanel() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterOrgId, setFilterOrgId] = useState<string>("")

  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [action, setAction] = useState<"add" | "remove">("add")
  const [submitting, setSubmitting] = useState(false)
  const [affPage, setAffPage] = useState(1)

  useEffect(() => {
    fetchAffiliations()
    fetchDrivers()
    fetchOrgs()
  }, [])

  const fetchAffiliations = async (silent = false, orgIdOverride?: string) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      const effectiveOrgId = orgIdOverride !== undefined ? orgIdOverride : filterOrgId
      const url = effectiveOrgId ? `/api/admin/driver-affiliations?orgId=${effectiveOrgId}` : "/api/admin/driver-affiliations"
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to fetch affiliations")
      } else {
        setAffiliations(data.affiliations ?? [])
      }
    } catch {
      setError("Something went wrong")
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (res.ok) {
        const driverUsers = (data.users ?? []).filter((u: any) => u.User_Type === "D")
        setDrivers(driverUsers)
      }
    } catch {
      // ignore
    }
  }

  const fetchOrgs = async () => {
    try {
      const res = await fetch("/api/admin/sponsors")
      const data = await res.json()
      if (res.ok) {
        setOrgs(data.sponsorOrgs ?? [])
      }
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedDriverId || !selectedOrgId) {
      setError("Driver and Organization are required")
      return
    }

    setSubmitting(true)

    try {
      const method = action === "add" ? "POST" : "DELETE"
      const res = await fetch("/api/admin/driver-affiliations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(selectedDriverId),
          orgId: parseInt(selectedOrgId),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Failed to ${action} driver`)
      } else {
        setSuccess(action === "add" 
          ? "Driver added to organization successfully" 
          : "Driver removed from organization successfully"
        )
        setSelectedDriverId("")
        setSelectedOrgId("")
        fetchAffiliations(true)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white text-zinc-900 shadow rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
        <h2 className="text-xl font-bold mb-4">Manage Driver Affiliation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Driver</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 rounded-md"
              >
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.User_ID} value={d.User_ID}>
                    {d.Username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 rounded-md"
              >
                <option value="">Select Organization</option>
                {orgs.map((o) => (
                  <option key={o.Org_ID} value={o.Org_ID}>
                    {o.Org_Name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAction("add")}
                  className={`flex-1 py-2 px-3 rounded-md border transition-colors ${
                    action === "add"
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                  }`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAction("remove")}
                  className={`flex-1 py-2 px-3 rounded-md border transition-colors ${
                    action === "remove"
                      ? "bg-red-600 text-white border-red-600"
                      : "border-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                  }`}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              action === "add"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } disabled:opacity-50`}
          >
            {submitting ? "Processing..." : action === "add" ? "Add Driver to Organization" : "Remove Driver from Organization"}
          </button>
        </form>
      </div>

      <div className="bg-white text-zinc-900 shadow rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Driver Affiliations</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm">Filter by Org:</label>
            <select
              value={filterOrgId}
              onChange={(e) => {
                const newOrgId = e.target.value
                setFilterOrgId(newOrgId)
                setAffPage(1)
                fetchAffiliations(false, newOrgId)
              }}
              className="border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-1 rounded-md"
            >
              <option value="">All Organizations</option>
              {orgs.map((o) => (
                <option key={o.Org_ID} value={o.Org_ID}>
                  {o.Org_Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : affiliations.length === 0 ? (
          <p className="text-gray-500">No affiliations found.</p>
        ) : (
          <div className="overflow-x-auto">
            {refreshing && <p className="text-xs text-gray-400 mb-1">Refreshing...</p>}
            <div className="rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                <thead className="bg-gray-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {affiliations.slice((affPage - 1) * PAGE_SIZE, affPage * PAGE_SIZE).map((aff) => (
                    <tr key={`${aff.User_ID}-${aff.Org_ID}`} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{aff.Driver_Username}</td>
                      <td className="px-4 py-3 text-sm">{aff.Org_Name}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{aff.Point_Count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={affPage} total={affiliations.length} onChange={setAffPage} />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </div>
  )
}
