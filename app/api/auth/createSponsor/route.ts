// app/api/auth/createSponsor/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const { Org_Name } = await req.json()
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

    if (!Org_Name) {
      return NextResponse.json(
        { error: "Sponsor organization name required." },
        { status: 400 }
      )
    }

    // Check if sponsor org already exists
    const existingOrg = await prisma.sponsor_Org.findFirst({
        where: { Org_Name },
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: "Sponsor organization already exists" },
        { status: 400 }
      )
    }

    // Create sponsor organization with name
    const sponOrg = await prisma.sponsor_Org.create({
      data: {
        Org_Name: Org_Name,
      },
    })

    return NextResponse.json(
      {
        message: "Sponsor organization created successfully.",
        userId: sponOrg.Org_ID,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}