"use client"

import { useState } from "react"

type JoinedOrganization = {
  Org_ID: number
  Org_Name: string
  Point_Count: number
  joinedDate: string | null
}

type PointsOverviewProps = {
  joinedOrganizations: JoinedOrganization[]
  selectedOrgId: number | null
  onSelectOrg: (orgId: number | null) => void
}

export function PointsOverview({
  joinedOrganizations,
  selectedOrgId,
  onSelectOrg,
}: PointsOverviewProps) {
  const selectedOrg = joinedOrganizations.find((org) => org.Org_ID === selectedOrgId)
  const totalPoints = joinedOrganizations.reduce((sum, org) => sum + org.Point_Count, 0)
  const displayPoints = selectedOrg ? selectedOrg.Point_Count : totalPoints

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <select
            value={selectedOrgId ?? "all"}
            onChange={(e) => {
              const value = e.target.value
              onSelectOrg(value === "all" ? null : parseInt(value, 10))
            }}
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all" className="text-gray-800">All Organizations</option>
            {joinedOrganizations.map((org) => (
              <option key={org.Org_ID} value={org.Org_ID} className="text-gray-800">
                {org.Org_Name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center md:text-right">
          <p className="text-white/80 text-sm">
            {selectedOrg ? `in ${selectedOrg.Org_Name}` : "Total across all organizations"}
          </p>
        </div>
      </div>

      <div className="text-center py-6">
        <div className="text-5xl md:text-6xl font-bold mb-2">
          {displayPoints.toLocaleString()}
        </div>
        <div className="text-xl text-white/90">Points</div>
      </div>

      {selectedOrg && joinedOrganizations.length > 1 && (
        <div className="text-center text-white/70 text-sm">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            + {totalPoints - displayPoints} pts in other orgs
          </span>
        </div>
      )}
    </div>
  )
}
