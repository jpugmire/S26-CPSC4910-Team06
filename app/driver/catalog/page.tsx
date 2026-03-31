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

    <main className="max-w-7xl mx-auto py-6 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <p>
          <strong>Organization:</strong> {driverOrg?.Sponsor_Org?.Org_Name}
        </p>

        <p>
          <strong>Your Points:</strong> {driverOrg?.Point_Count ?? 0}
        </p>

        <hr className="my-4" />

        <p className="font-semibold mb-4">Catalog Items:</p>

        {listings.length === 0 ? (
          <p>No items in catalog yet.</p>
        ) : (
          <CatalogSearch items={items} />
        )}
      </div>
    </main>
  </div>
)
}