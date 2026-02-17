// app/api/admin/sponsors/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session  = await auth();

    // Validation
    if (!session) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 400 }
      )
    }

    if (session?.user?.role !== 'A') {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 400 }
      )
    }

    // Find all sponsors.
    const sponsorOrgs = await prisma.sponsor_Org.findMany({
      select: {
        Org_ID: true,
        Org_Name: true,
      },
    })

    return NextResponse.json(
      {
        message: "Successfully fetched all sponsors.",
        sponsorOrgs: sponsorOrgs,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Sponsor fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}