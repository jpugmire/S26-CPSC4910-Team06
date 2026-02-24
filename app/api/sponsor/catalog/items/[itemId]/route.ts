import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { itemId } = await params
    const itemIdNum = parseInt(itemId)

    if (isNaN(itemIdNum)) {
      return NextResponse.json({ error: "Invalid item ID." }, { status: 400 })
    }

    const { pointPrice } = await req.json()

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

    const catalog = await prisma.catalog.findFirst({
      where: {
        Org_ID: sponsor.Org_ID,
      },
    })

    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found." },
        { status: 400 }
      )
    }

    const listing = await prisma.catalog_Listing.findFirst({
      where: {
        Catalog_ID: catalog.Catalog_ID,
        Item_ID: itemIdNum,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Item not in catalog." },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.catalog_Item.update({
      where: {
        Item_ID: itemIdNum,
      },
      data: {
        Point_Price: pointPrice,
      },
    })

    return NextResponse.json(
      {
        message: "Item updated successfully.",
        item: {
          Item_ID: updatedItem.Item_ID,
          Item_Name: updatedItem.Item_Name,
          Point_Price: updatedItem.Point_Price,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update catalog item error:", error)
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { itemId } = await params
    const itemIdNum = parseInt(itemId)

    if (isNaN(itemIdNum)) {
      return NextResponse.json({ error: "Invalid item ID." }, { status: 400 })
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

    const catalog = await prisma.catalog.findFirst({
      where: {
        Org_ID: sponsor.Org_ID,
      },
    })

    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found." },
        { status: 400 }
      )
    }

    const listing = await prisma.catalog_Listing.findFirst({
      where: {
        Catalog_ID: catalog.Catalog_ID,
        Item_ID: itemIdNum,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Item not in catalog." },
        { status: 400 }
      )
    }

    await prisma.catalog_Listing.delete({
      where: {
        Catalog_ID_Item_ID: {
          Catalog_ID: catalog.Catalog_ID,
          Item_ID: itemIdNum,
        },
      },
    })

    return NextResponse.json(
      { message: "Item removed from catalog successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Remove catalog item error:", error)
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}
