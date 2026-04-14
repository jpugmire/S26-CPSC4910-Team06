import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import { prisma } from "@/lib/prisma"
import CatalogSearch from "@/components/driver/catalog-search"
import ImpersonationBanner from "@/components/impersonation-banner"

export default async function DriverCatalogPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "D") {
    redirect("/dashboard")
  }

  const driver = await prisma.driver.findFirst({
    where: {
      User_ID: parseInt(session.user.id || "0"),
    },
    include: {
      Driver_Sponsor_Org: {
        include: {
          Sponsor_Org: true,
        },
      },
    },
  })

  if (!driver || driver.Driver_Sponsor_Org.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <Navbar />
        {session?.user?.impersonating && (<ImpersonationBanner />)}
        <main className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold mb-6">Driver Catalog</h1>

          <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow rounded-lg p-6">
            <p>No organization assigned.</p>
          </div>
        </main>
      </div>
    )
  }

  const firstOrg = driver.Driver_Sponsor_Org[0]
  const orgId = firstOrg.Org_ID

  const catalog = await prisma.catalog.findFirst({
    where: {
      Org_ID: orgId,
    },
  })

  const listings = await prisma.catalog_Listing.findMany({
    where: {
      Catalog_ID: catalog?.Catalog_ID,
    },
    include: {
      Catalog_Item: true,
    },
  })

  const items = listings.map((listing) => ({
    Item_ID: listing.Catalog_Item.Item_ID,
    Item_Name: listing.Catalog_Item.Item_Name,
    Item_Image_URL: listing.Catalog_Item.Item_Image_URL,
    Point_Price: listing.Catalog_Item.Point_Price,
  }))

  const pointBalance = firstOrg.Point_Count

  return (
    <div className="min-h-screen bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <Navbar />
      {session?.user?.impersonating && (<ImpersonationBanner />)}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Driver Catalog</h1>

        <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow rounded-lg p-6 mb-6">
          <p>
            <strong>Organization:</strong> {firstOrg.Sponsor_Org.Org_Name}
          </p>
          <p>
            <strong>Point Balance:</strong> {pointBalance}
          </p>
          {driver.Driver_Sponsor_Org.length > 1 && (
            <p className="text-sm text-gray-500 mt-2">
              You belong to {driver.Driver_Sponsor_Org.length} organizations. Showing catalog for {firstOrg.Sponsor_Org.Org_Name}.
            </p>
          )}
        </div>

        {catalog ? (
          <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow rounded-lg p-6">
            <p className="font-semibold mb-4">Catalog Items:</p>

            {listings.length === 0 ? (
              <p>No items in catalog yet.</p>
            ) : (
              <CatalogSearch items={items} />
            )}
          </div>
        ) : (
          <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow rounded-lg p-6">
            <p>No catalog exists for this organization.</p>
          </div>
        )}
      </main>
    </div>
  )
}
