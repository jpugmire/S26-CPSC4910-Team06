"use client"

import { useEffect, useState } from "react"

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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterOrgId, setFilterOrgId] = useState<string>("")

  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [action, setAction] = useState<"add" | "remove">("add")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAffiliations()
    fetchDrivers()
    fetchOrgs()
  }, [])

  const fetchAffiliations = async () => {
    setLoading(true)
    try {
      const url = filterOrgId ? `/api/admin/driver-affiliations?orgId=${filterOrgId}` : "/api/admin/driver-affiliations"
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
      setLoading(false)
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
        fetchAffiliations()
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
                className="w-full border px-3 py-2 rounded-md dark:bg-zinc-700"
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
                className="w-full border px-3 py-2 rounded-md dark:bg-zinc-700"
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
                setFilterOrgId(e.target.value)
                fetchAffiliations()
              }}
              className="border px-3 py-1 rounded-md dark:bg-zinc-700"
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
            <table className="min-w-full border">
              <thead className="bg-gray-100 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 border text-left">Driver</th>
                  <th className="px-4 py-2 border text-left">Organization</th>
                  <th className="px-4 py-2 border text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {affiliations.map((aff) => (
                  <tr key={`${aff.User_ID}-${aff.Org_ID}`} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <td className="px-4 py-2 border">
                      <div className="font-medium">{aff.Driver_Username}</div>
                    </td>
                    <td className="px-4 py-2 border">{aff.Org_Name}</td>
                    <td className="px-4 py-2 border text-right font-mono">{aff.Point_Count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </div>
  )
}
