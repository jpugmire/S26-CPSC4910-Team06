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

    const { orgId } = await req.json()

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const membership = await prisma.driver_Sponsor_Org.findUnique({
      where: {
        User_ID_Org_ID: {
          User_ID: parseInt(session.user.id),
          Org_ID: orgId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "You are not part of this organization" }, { status: 400 })
    }

    await prisma.driver_Sponsor_Org.delete({
      where: {
        User_ID_Org_ID: {
          User_ID: parseInt(session.user.id),
          Org_ID: orgId,
        },
      },
    })

    return NextResponse.json({
      message: "You have left the organization successfully",
    }, { status: 200 })
  } catch (error) {
    console.error("Error leaving organization:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
