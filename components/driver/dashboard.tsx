"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PointsOverview } from "./points-overview"
import { OrganizationCard } from "./organization-card"
import { RecentTransactions } from "./recent-transactions"
import { MembershipStatus } from "./membership-status"
import { AuditReportPanel } from "@/components/audit-report-panel"

type PendingApplication = {
  Application_ID: number
  Org_ID: number
  Application_Date: string
  Sponsor_Org: {
    Org_ID: number
    Org_Name: string
  }
}

type PastApplication = {
  Application_ID: number
  Org_ID: number
  Org_Name: string
  Status: string
  Application_Date: string
  Review_Date: string | null
}

type JoinedOrganization = {
  Org_ID: number
  Org_Name: string
  Point_Count: number
  joinedDate: string | null
}

type DriverDashboardData = {
  pendingApplications: PendingApplication[]
  pastApplications: PastApplication[]
  joinedOrganizations: JoinedOrganization[]
}

export default function DriverDashboard({ driverId }: { driverId: number }) {
  const [data, setData] = useState<DriverDashboardData | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/driver/application")
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      const dashboardData = await res.json()
      setData(dashboardData)
      if (dashboardData.joinedOrganizations.length > 0) {
        setSelectedOrgId(dashboardData.joinedOrganizations[0].Org_ID)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveOrganization = async (orgId: number, orgName: string) => {
    try {
      const res = await fetch("/api/driver/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to leave organization")
      }

      alert(`You have left ${orgName}.`)
      await fetchDashboardData()
      if (selectedOrgId === orgId) {
        setSelectedOrgId(data?.joinedOrganizations.find(o => o.Org_ID !== orgId)?.Org_ID ?? null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to leave organization")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <PointsOverview
        joinedOrganizations={data.joinedOrganizations}
        selectedOrgId={selectedOrgId}
        onSelectOrg={setSelectedOrgId}
      />

      {data.joinedOrganizations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.joinedOrganizations.map((org) => (
              <OrganizationCard
                key={org.Org_ID}
                org={org}
                isSelected={selectedOrgId === org.Org_ID}
                onSelect={setSelectedOrgId}
                onLeave={handleLeaveOrganization}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions selectedOrgId={selectedOrgId} />
        <MembershipStatus
          pendingApplications={data.pendingApplications}
          joinedOrganizations={data.joinedOrganizations}
          pastApplications={data.pastApplications}
        />
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/driver/apply"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Apply to New Organization
        </Link>
        <Link
          href="/driver/catalog"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          View Catalog
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Your Activity Log</h2>
        <AuditReportPanel
          orgId={selectedOrgId}
          isDriver={true}
          driverId={driverId}
        />
      </div>
    </div>
  )
}
