import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"

export default async function AboutPage() {
  const version = await prisma.version.findFirst({
    orderBy: { VersionCreated: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-md rounded-lg p-8">
          
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">About</h1>
            <p className="text-gray-500">
              Information about the Driver Rewards System
            </p>
          </div>

          {/* VERSION INFO */}
          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Current Version</p>
            <p className="font-semibold text-lg">
              {version?.VersionNum ?? "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-3">Release Date</p>
            <p className="font-semibold">
              {version?.VersionCreated
                ? version.VersionCreated.toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About This App</h2>
            <p className="text-gray-600">
              This system allows drivers to earn and redeem points through their
              sponsor organizations. Users can browse catalogs, add items to a
              cart, and redeem rewards using their accumulated points.
            </p>
          </div>

          {/* BACK LINK */}
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}