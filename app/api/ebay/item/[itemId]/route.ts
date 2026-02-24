import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getEbayItemDetails } from "@/lib/ebay"

export async function GET(
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

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required." },
        { status: 400 }
      )
    }

    const itemDetails = await getEbayItemDetails(itemId)

    return NextResponse.json(
      {
        message: "Item details retrieved successfully.",
        item: {
          itemId: itemDetails.itemId,
          title: itemDetails.title,
          price: itemDetails.price,
          condition: itemDetails.condition,
          availability: itemDetails.availability,
          imageUrl: itemDetails.image?.imageUrl,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("eBay item details error:", error)
    return NextResponse.json(
      { error: "Failed to get item details." },
      { status: 500 }
    )
  }
}
