import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import ImpersonationBanner from "@/components/impersonation-banner"
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
    <div className="min-h-screen bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <Navbar />
      {session?.user?.impersonating && (<ImpersonationBanner />)}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Driver Dashboard
        </h1>
        <DriverDashboard driverId={Number(session.user.id)} />
      </main>
    </div>
  )
}
