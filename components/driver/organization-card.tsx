"use client"

import { useState } from "react"

type JoinedOrganization = {
  Org_ID: number
  Org_Name: string
  Point_Count: number
  joinedDate: string | null
}

type OrganizationCardProps = {
  org: JoinedOrganization
  isSelected: boolean
  onSelect: (orgId: number) => void
  onLeave: (orgId: number, orgName: string) => void
}

function getMembershipDuration(joinedDate: string | null): string {
  if (!joinedDate) return "Unknown"

  const joined = new Date(joinedDate)
  const now = new Date()
  const diffMs = now.getTime() - joined.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return "Today"
  if (diffDays === 1) return "1 day"
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
}

export function OrganizationCard({ org, isSelected, onSelect, onLeave }: OrganizationCardProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const duration = getMembershipDuration(org.joinedDate)

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to leave ${org.Org_Name}?`)) {
      return
    }
    setIsLeaving(true)
    await onLeave(org.Org_ID, org.Org_Name)
    setIsLeaving(false)
  }

  return (
    <div
      onClick={() => onSelect(org.Org_ID)}
      className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-blue-500 shadow-md"
          : "hover:shadow-md hover:border-blue-200 border border-transparent"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 truncate">{org.Org_Name}</h3>
        {isSelected && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
            Selected
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-blue-600 mb-1">
        {org.Point_Count.toLocaleString()} pts
      </div>
      <div className="text-sm text-gray-500">Member for {duration}</div>
      <button
        onClick={handleLeave}
        disabled={isLeaving}
        className="mt-3 w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-1 px-2 rounded transition-colors disabled:opacity-50"
      >
        {isLeaving ? "Leaving..." : "Leave Organization"}
      </button>
    </div>
  )
}
