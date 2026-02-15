import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreateUserForm } from "@/components/userCreate-form"

export default async function AdminPage() {
  const session = await auth()

  // not logged in
  if (!session) redirect("/login")

  // not admin
  if (session.user?.role !== "A") redirect("/dashboard")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Create New User
              </h1>
              <CreateUserForm />
            </div>
          </div>
        </div>
  )
}