import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const sponsor = await prisma.sponsor.findFirst({
      where: {
        User_ID: parseInt(session.user.id || "0"),
      },
      include: {
        Sponsor_Org: true,
      },
    })

    if (!sponsor || !sponsor.Org_ID) {
      return NextResponse.json(
        { error: "Sponsor organization not found." },
        { status: 400 }
      )
    }

    let catalog = await prisma.catalog.findFirst({
      where: {
        Org_ID: sponsor.Org_ID,
      },
    })

    if (!catalog) {
      catalog = await prisma.catalog.create({
        data: {
          Org_ID: sponsor.Org_ID,
        },
      })
    }

    const listings = await prisma.catalog_Listing.findMany({
      where: {
        Catalog_ID: catalog.Catalog_ID,
      },
      include: {
        Catalog_Item: true,
      },
    })

    const items = listings.map((listing: any) => ({
      Item_ID: listing.Catalog_Item.Item_ID,
      Item_Name: listing.Catalog_Item.Item_Name,
      Item_Description: listing.Catalog_Item.Item_Description,
      Item_Image_URL: listing.Catalog_Item.Item_Image_URL,
      Ebay_Item_ID: listing.Catalog_Item.Ebay_Item_ID,
      Point_Price: listing.Catalog_Item.Point_Price,
    }))

    return NextResponse.json(
      {
        message: "Catalog retrieved successfully.",
        catalog: {
          Catalog_ID: catalog.Catalog_ID,
          Org_ID: catalog.Org_ID,
          Org_Name: sponsor.Sponsor_Org?.Org_Name,
          items,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get catalog error:", error)
    return NextResponse.json({ error: "An error occurred." }, { status: 500 })
  }
}
