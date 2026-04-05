import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import DriverDashboard from "@/components/driver/dashboard"

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  if (session.user.role === "S") {
    redirect("/sponsorConsole")
  }

  if (session.user.role === "A") {
    redirect("/adminConsole")
  }

  if (session.user.role !== "D") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Driver Dashboard
        </h1>
        <DriverDashboard />
      </main>
    </div>
  )
}
