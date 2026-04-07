import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import { SponsorCatalogManager } from "@/components/sponsor/catalog-manager"
import ImpersonationBanner from "@/components/impersonation-banner"

export default async function SponsorCatalogPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "S") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {session?.user?.impersonating && (<ImpersonationBanner />)}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Catalog</h1>
        <SponsorCatalogManager />
      </main>
    </div>
  )
}
