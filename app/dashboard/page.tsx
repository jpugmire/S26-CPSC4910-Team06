// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { LoginToast } from "@/components/login-toast"
import { Suspense } from "react"
import Navbar from "@/components/navbar"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={null}>
        <LoginToast />
      </Suspense>
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Dashboard
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