import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreateUserForm } from "@/components/userCreate-form"
import { CreateSponsorForm } from "@/components/sponsorOrgCreate-form"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()

  // not logged in
  if (!session) redirect("/login")

  // not admin
  if (session.user?.role !== "A") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 gap-10">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Create New User
              </h1>
              <CreateUserForm />
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Create New Sponsor Organization
              </h1>
              <CreateSponsorForm />
            </div>
          </div>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
  )
}