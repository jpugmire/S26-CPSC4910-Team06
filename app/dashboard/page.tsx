// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">Driver Rewards Dashboard</h1>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome, {session.user.username}!
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Role:</strong> {session.user.role}
            </p>
            <p>
              <strong>Email:</strong> {session.user.email || "Not provided"}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}