import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import { prisma } from "@/lib/prisma"
import CatalogSearch from "@/components/driver/catalog-search"

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
      driverSponsorOrgs: {
        include: {
          Sponsor_Org: true,
        },
      },
    },
  })

  const driverOrg = driver?.driverSponsorOrgs[0]

  const catalog = await prisma.catalog.findFirst({
    where: {
      Org_ID: driverOrg?.Org_ID,
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

  if (!driver || !driverOrg) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold mb-6">Driver Catalog</h1>

          <div className="bg-white shadow rounded-lg p-6">
            <p>No organization assigned.</p>
          </div>
        </main>
      </div>
    )
  }

  const items = listings.map((listing: any) => ({
    Item_ID: listing.Catalog_Item.Item_ID,
    Item_Name: listing.Catalog_Item.Item_Name,
    Item_Image_URL: listing.Catalog_Item.Item_Image_URL,
    Point_Price: listing.Catalog_Item.Point_Price,
  }))

return (
  <div className="min-h-screen bg-gray-100">
    <Navbar />

    <main className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white shadow-md rounded-lg p-8">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Catalog</h1>
          <p className="text-gray-500">
            Browse and redeem rewards from your organization
          </p>
        </div>

        {/* INFO BAR */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 border rounded-lg p-4 mb-6">
          
          <div>
            <p className="text-sm text-gray-500">Organization</p>
            <p className="font-semibold">
              {driverOrg?.Sponsor_Org?.Org_Name}
            </p>
          </div>

          <div className="mt-3 sm:mt-0 text-right">
            <p className="text-sm text-gray-500">Your Points</p>
            <p className="text-xl font-bold text-blue-600">
              {driverOrg?.Point_Count ?? 0}
            </p>
          </div>

        </div>

        {/* SECTION TITLE */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Available Rewards</h2>
        </div>

        {/* CONTENT */}
        {listings.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No items in catalog yet.
          </div>
        ) : (
          <CatalogSearch items={items} />
        )}
      </div>
    </main>
  </div>
)
}