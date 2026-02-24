import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getEbayItemDetails } from "@/lib/ebay"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { ebayItemId, pointPrice } = await req.json()

    if (!ebayItemId) {
      return NextResponse.json(
        { error: "eBay item ID is required." },
        { status: 400 }
      )
    }

    const sponsor = await prisma.sponsor.findFirst({
      where: {
        User_ID: parseInt(session.user.id || "0"),
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

    const existingItem = await prisma.catalog_Item.findFirst({
      where: {
        Ebay_Item_ID: ebayItemId,
      },
    })

    if (existingItem) {
      const existingListing = await prisma.catalog_Listing.findFirst({
        where: {
          Catalog_ID: catalog.Catalog_ID,
          Item_ID: existingItem.Item_ID,
        },
      })

      if (existingListing) {
        return NextResponse.json(
          { error: "Item already in catalog." },
          { status: 400 }
        )
      }
    }

    let itemDetails
    try {
      itemDetails = await getEbayItemDetails(ebayItemId)
    } catch (ebayError) {
      console.error("Failed to fetch eBay item details:", ebayError)
      return NextResponse.json(
        { error: "Could not fetch item details from eBay." },
        { status: 400 }
      )
    }

    let catalogItem

    if (existingItem) {
      catalogItem = existingItem
    } else {
      catalogItem = await prisma.catalog_Item.create({
        data: {
          Item_Name: itemDetails.title.substring(0, 255),
          Item_Description: itemDetails.description || itemDetails.shortDescription,
          Item_Image_URL: itemDetails.image?.imageUrl,
          Ebay_Item_ID: ebayItemId,
          Point_Price: pointPrice || null,
        },
      })
    }

    await prisma.catalog_Listing.create({
      data: {
        Catalog_ID: catalog.Catalog_ID,
        Item_ID: catalogItem.Item_ID,
      },
    })

    return NextResponse.json(
      {
        message: "Item added to catalog successfully.",
        item: {
          Item_ID: catalogItem.Item_ID,
          Item_Name: catalogItem.Item_Name,
          Item_Image_URL: catalogItem.Item_Image_URL,
          Ebay_Item_ID: catalogItem.Ebay_Item_ID,
          Point_Price: catalogItem.Point_Price,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Add to catalog error:", error)
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}
