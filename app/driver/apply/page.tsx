"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Organization {
  Org_ID: number
  Org_Name: string
}

interface ApplicationStatus {
  status: "can_apply" | "pending" | "joined"
  message: string
  application?: {
    Application_ID: number
    Org_ID: number
    Status: string
    Application_Date: Date
  }
  orgId?: number
}

export default function DriverApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
      setStatus(data)
      
      if (data.status === "can_apply") {
        fetchOrganizations()
      }
    } catch {
      setError("Failed to check application status")
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrganizations() {
    try {
      const res = await fetch("/api/driver/organizations")
      const data = await res.json()
      if (res.ok) {
        setOrganizations(data.organizations)
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
        checkStatus()
      }
    } catch {
      setError("Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (status?.status === "joined") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Already Joined</h1>
          <p className="text-gray-600">{status.message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (status?.status === "pending") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-yellow-600 text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Application Pending</h1>
          <p className="text-gray-600 mb-4">{status.message}</p>
          {status.application && (
            <p className="text-sm text-gray-500">
              Applied on: {new Date(status.application.Application_Date).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Apply to a Sponsor</h1>
        <p className="text-gray-600 mb-6">
          Select an organization to apply to. Once approved, you&apos;ll be able to earn points and redeem rewards.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

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
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedOrg}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
