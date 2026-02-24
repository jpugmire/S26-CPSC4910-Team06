import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { searchEbayItems } from "@/lib/ebay"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: "Search keyword is required." },
        { status: 400 }
      )
    }

    const results = await searchEbayItems(keyword.trim(), limit, offset)

    return NextResponse.json(
      {
        message: "Search results retrieved successfully.",
        ...results,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("eBay search error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to search eBay items."
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
