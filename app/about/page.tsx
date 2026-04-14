import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import ImpersonationBanner from "@/components/impersonation-banner"
import { auth } from "@/auth"

export default async function AboutPage() {
  const session = await auth();
  const version = await prisma.version.findFirst({
    orderBy: { VersionCreated: "desc" },
  })

  return (
    <>
      <Navbar />
      {session?.user?.impersonating && (<ImpersonationBanner />)}
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
  <div className="rounded-lg bg-white p-8 shadow-md text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
    <h1 className="mb-4 text-2xl font-bold">About Page</h1>
    <p>Version: {version?.VersionNum}</p>
    <p>Created on: {version?.VersionCreated?.toLocaleDateString()}</p>
    <Link
      href="/dashboard"
      className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
    >
      Back to Dashboard
    </Link>
  </div>
</div>
    </>
  )
}
