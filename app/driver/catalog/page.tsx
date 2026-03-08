import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import { prisma } from "@/lib/prisma"

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
      Sponsor_Org: true,
    },
  })

  const catalog = await prisma.catalog.findFirst({
    where: {
      Org_ID: driver!.Org_ID!,
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

  if (!driver || !driver.Org_ID) {
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
  <p>
    <strong>Org ID:</strong> {driver.Org_ID}
  </p>

  <p>
    <strong>Organization:</strong> {driver.Sponsor_Org?.Org_Name}
  </p>

  <hr className="my-4" />

  {catalog ? (
    <p>
      Catalog found! Catalog ID: <strong>{catalog.Catalog_ID}</strong>
    </p>
  ) : (
    <p>No catalog exists for this organization.</p>
  )}

<hr className="my-4" />

<p className="font-semibold mb-4">Catalog Items:</p>

{listings.length === 0 ? (
  <p>No items in catalog yet.</p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {listings.map((listing) => (
      <div
        key={listing.Item_ID}
        className="bg-white border rounded-lg shadow p-4"
      >
        {listing.Catalog_Item.Item_Image_URL && (
          <img
            src={listing.Catalog_Item.Item_Image_URL}
            alt={listing.Catalog_Item.Item_Name}
            className="w-full h-40 object-contain mb-3"
          />
        )}

        <p className="font-semibold text-lg">
          {listing.Catalog_Item.Item_Name}
        </p>

        <p className="text-gray-600">
          {listing.Catalog_Item.Point_Price === 1
            ? "1 point"
            : `${listing.Catalog_Item.Point_Price ?? "No"} points`}
         </p>
      </div>
    ))}
  </div>
)}

</div>
  )
}