// app/api/driver/leave/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "D") {
      return NextResponse.json({ error: "Not authorized" }, { status: 400 })
    }

    const driver = await prisma.driver.findUnique({
      where: { User_ID: parseInt(session.user.id) },
    })

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 400 })
    }

    if (!driver.Org_ID) {
      return NextResponse.json({ error: "You are not part of an organization" }, { status: 400 })
    }

    const updatedDriver = await prisma.driver.update({
      where: { User_ID: parseInt(session.user.id) },
      data: { Org_ID: null },
    })

    return NextResponse.json({
      message: "You have left the organization successfully",
    }, { status: 200 })
  } catch (error) {
    console.error("Error leaving organization:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
