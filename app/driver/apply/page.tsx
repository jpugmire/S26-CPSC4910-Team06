"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Organization {
  Org_ID: number
  Org_Name: string
}

interface Application {
  Application_ID: number
  Org_ID: number
  Status: string
  Application_Date: Date
  Sponsor_Org: Organization
}

interface ApplicationStatus {
  pendingApplications: Application[]
  pastApplications: Application[]
  joinedOrganizations: Organization[]
}

export default function DriverApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [status, setStatus] = useState<ApplicationStatus | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  async function checkStatus() {
    setLoading(true)
    try {
      const res = await fetch("/api/driver/application")
      const data = await res.json()
      if (res.ok) {
        setStatus(data)
        fetchOrganizations(data.joinedOrganizations || [], data.pendingApplications || [])
      }
    } catch {
      setError("Failed to check application status")
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrganizations(joinedOrgs: Organization[], pendingApps: Application[]) {
    try {
      const res = await fetch("/api/driver/organizations")
      const data = await res.json()
      if (res.ok) {
        const joinedOrgIds = joinedOrgs.map((o) => o.Org_ID)
        const pendingOrgIds = pendingApps.map((a) => a.Org_ID)
        const availableOrgs = data.organizations.filter(
          (org: Organization) => !joinedOrgIds.includes(org.Org_ID) && !pendingOrgIds.includes(org.Org_ID)
        )
        setOrganizations(availableOrgs)
      }
    } catch {
      setError("Failed to load organizations")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrg) {
      setError("Please select an organization")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/driver/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: selectedOrg }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit application")
      } else {
        setSuccess("Application submitted successfully!")
        setSelectedOrg(null)
        checkStatus()
      }
    } catch {
      setError("Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLeave(orgId: number) {
    if (!confirm("Are you sure you want to leave this organization?")) {
      return
    }

    setLeaving(orgId)
    setError("")
    try {
      const res = await fetch("/api/driver/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to leave organization")
      } else {
        checkStatus()
      }
    } catch {
      setError("Failed to leave organization")
    } finally {
      setLeaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Manage Sponsorships</h1>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {status?.joinedOrganizations && status.joinedOrganizations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Joined Organizations</h2>
            <div className="space-y-3">
              {status.joinedOrganizations.map((org) => (
                <div key={org.Org_ID} className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                  <span className="font-medium">{org.Org_Name}</span>
                  <button
                    onClick={() => handleLeave(org.Org_ID)}
                    disabled={leaving === org.Org_ID}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {leaving === org.Org_ID ? "Leaving..." : "Leave"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {status?.pendingApplications && status.pendingApplications.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pending Applications</h2>
            <div className="space-y-3">
              {status.pendingApplications.map((app) => (
                <div key={app.Application_ID} className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                  <div>
                    <span className="font-medium">{app.Sponsor_Org.Org_Name}</span>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(app.Application_Date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status?.pastApplications && status.pastApplications.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Past Applications</h2>
            <div className="space-y-3">
              {status.pastApplications.map((app) => (
                <div key={app.Application_ID} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <span className="font-medium">{app.Sponsor_Org.Org_Name}</span>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(app.Application_Date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded ${
                    app.Status === "A" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {app.Status === "A" ? "Approved" : "Rejected"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Apply to New Organization</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Organization
              </label>
              <select
                value={selectedOrg || ""}
                onChange={(e) => setSelectedOrg(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select an organization --</option>
                {organizations.map((org) => (
                  <option key={org.Org_ID} value={org.Org_ID}>
                    {org.Org_Name}
                  </option>
                ))}
              </select>
              {organizations.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No organizations available to apply to.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedOrg}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
