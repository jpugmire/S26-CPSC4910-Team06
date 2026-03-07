// app/api/sponsor/points/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const { driverId, pointValue } = await req.json()
    const session  = await auth();

    // Validation
    if (!session) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 400 }
      )
    }

    if (session?.user?.role !== 'S') {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 400 }
      )
    }

    if (!driverId || !pointValue ) {
      return NextResponse.json(
        { error: "Driver ID and Point Value required." },
        { status: 400 }
      )
    }

    // Update driver's points
    const driver = await prisma.driver.update({
        where:
        {
            User_ID: driverId,
        },
        data:
        {
            Point_Count: {increment: pointValue},
        },
    })

    return NextResponse.json(
      {
        message: "Driver points updated successfully.",
        driverId: driver.User_ID,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Point update error:", error)
    return NextResponse.json(
      { error: "An error occurred during point update." },
      { status: 500 }
    )
  }
}
