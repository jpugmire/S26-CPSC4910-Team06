"use client"

type PendingApplication = {
  Application_ID: number
  Org_ID: number
  Application_Date: string
  Sponsor_Org: {
    Org_ID: number
    Org_Name: string
  }
}

type JoinedOrganization = {
  Org_ID: number
  Org_Name: string
  Point_Count: number
  joinedDate: string | null
}

type PastApplication = {
  Application_ID: number
  Org_ID: number
  Status: string
  Application_Date: string
  Review_Date: string | null
  Sponsor_Org?: {
    Org_ID: number
    Org_Name: string
  }
}

type MembershipStatusProps = {
  pendingApplications: PendingApplication[]
  joinedOrganizations: JoinedOrganization[]
  pastApplications: PastApplication[]
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`
  return `${Math.floor(diffDays / 365)} year${diffDays >= 730 ? "s" : ""} ago`
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""}`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""}`
  return `${Math.floor(diffDays / 365)} year${diffDays >= 730 ? "s" : ""}`
}

export function MembershipStatus({
  pendingApplications,
  joinedOrganizations,
  pastApplications,
}: MembershipStatusProps) {
  const recentActivity = [
    ...joinedOrganizations.map((org) => ({
      type: "joined" as const,
      orgName: org.Org_Name,
      date: org.joinedDate || "",
      description: `Joined ${org.Org_Name}`,
    })),
    ...pastApplications
      .filter((app) => app.Status === "A" && app.Review_Date)
      .map((app) => ({
        type: "approved" as const,
        orgName: app.Sponsor_Org?.Org_Name || "Unknown Organization",
        date: app.Review_Date || app.Application_Date,
        description: `Application approved - ${app.Sponsor_Org?.Org_Name || "Unknown Organization"}`,
      })),
    ...pastApplications
      .filter((app) => app.Status === "R" && app.Review_Date)
      .map((app) => ({
        type: "rejected" as const,
        orgName: app.Sponsor_Org?.Org_Name || "Unknown Organization",
        date: app.Review_Date || app.Application_Date,
        description: `Application rejected - ${app.Sponsor_Org?.Org_Name || "Unknown Organization"}`,
      })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Membership Status</h2>

      {pendingApplications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
            Pending Applications
          </h3>
          <div className="space-y-2">
            {pendingApplications.map((app) => (
              <div
                key={app.Application_ID}
                className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-zinc-100">{app.Sponsor_Org.Org_Name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Applied to {app.Sponsor_Org.Org_Name} {formatRelativeTime(app.Application_Date)}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
        ) : (
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-600"></div>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="relative pl-8">
                  <div
                    className={`absolute left-1 top-1 w-3 h-3 rounded-full border-2 ${
                      item.type === "joined"
                        ? "bg-green-500 border-green-500"
                        : item.type === "approved"
                        ? "bg-blue-500 border-blue-500"
                        : "bg-red-500 border-red-500"
                    }`}
                  ></div>
                  <p className="font-medium text-gray-900 dark:text-zinc-100">{item.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(item.date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {joinedOrganizations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
            Your Organizations
          </h3>
          <div className="space-y-2">
            {joinedOrganizations.map((org) => (
              <div
                key={org.Org_ID}
                className="flex items-center justify-between py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-zinc-100">{org.Org_Name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member for {getMembershipDuration(org.joinedDate)}
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
