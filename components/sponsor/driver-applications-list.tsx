"use client"

import { useEffect, useState } from "react"

interface DriverApplication {
  Application_ID: number
  User_ID: number
  Org_ID: number
  Status: string
  Application_Date: Date
  Review_Date: Date | null
  User: {
    User_ID: number
    Username: string
    Email: string | null
    Phone: string | null
    Date_Added: Date
  }
}

export function DriverApplicationsList() {
  const [applications, setApplications] = useState<DriverApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewing, setReviewing] = useState<number | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    try {
      const res = await fetch("/api/sponsor/applications")
      const data = await res.json()
      if (res.ok) {
        setApplications(data.applications)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  async function handleReviewApplication(appId: number, status: "A" | "R") {
    if (!confirm(status === "A" ? "Approve this driver application?" : "Reject this driver application?")) {
      return
    }

    setError("")
    setReviewing(appId)
    try {
      const res = await fetch(`/api/sponsor/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to review application")
      } else {
        fetchApplications()
      }
    } catch {
      setError("Failed to review application")
    } finally {
      setReviewing(null)
    }
  }

  const pendingCount = applications.filter((a) => a.Status === "P").length

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Driver Applications</h3>
        {pendingCount > 0 && (
          <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500">No driver applications to your organization.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.Application_ID}
              className="border rounded-lg p-4 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{app.User.Username}</p>
                  <p className="text-sm text-gray-600">{app.User.Email}</p>
                  {app.User.Phone && (
                    <p className="text-sm text-gray-600">{app.User.Phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Applied: {new Date(app.Application_Date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {app.Status === "P" ? (
                    <>
                      <button
                        onClick={() => handleReviewApplication(app.Application_ID, "A")}
                        disabled={reviewing === app.Application_ID}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {reviewing === app.Application_ID ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReviewApplication(app.Application_ID, "R")}
                        disabled={reviewing === app.Application_ID}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {reviewing === app.Application_ID ? "..." : "Reject"}
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 text-sm rounded ${
                        app.Status === "A"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.Status === "A" ? "Approved" : "Rejected"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
