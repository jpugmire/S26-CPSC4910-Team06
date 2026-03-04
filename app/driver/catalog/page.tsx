import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"

export default async function DriverCatalogPage() {
  const session = await auth()

  // Not logged in
  if (!session) {
    redirect("/login")
  }

  // Not a driver
  if (session.user.role !== "D") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">
          Driver Catalog
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <p>This is the driver catalog page.</p>
          <p>Catalog items will go here.</p>
        </div>
      </main>
    </div>
  )
}