import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function AboutPage() {
  const version = await prisma.version.findFirst({
    orderBy: { VersionCreated: "asc" },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4">About Page</h1>
        <p>Version: {version?.VersionNum}</p>
        <p>Created on: {version?.VersionCreated?.toLocaleDateString()}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
    </div>
  )
}
