// app/api/driver/organizations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "D") {
      return NextResponse.json({ error: "Not authorized" }, { status: 400 })
    }

    const driverId = parseInt(session.user.id, 10)

    // Find organizations this driver belongs to
    const driverOrgs = await prisma.driver_Sponsor_Org.findMany({
      where: {
        User_ID: driverId,
      },
      select: {
        Org_ID: true,
      },
    })

    const orgIds = driverOrgs.map((d) => d.Org_ID)

    const organizations = await prisma.sponsor_Org.findMany({
      where: {
        Org_ID: {
          in: orgIds,
        },
      },
      select: {
        Org_ID: true,
        Org_Name: true,
      },
      orderBy: {
        Org_Name: "asc",
      },
    })

    return NextResponse.json({ organizations }, { status: 200 })
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
