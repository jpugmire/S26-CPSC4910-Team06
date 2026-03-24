// app/api/sponsor/applications/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized" }, { status: 400 })
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: parseInt(session.user.id) },
    })

    if (!sponsor || !sponsor.Org_ID) {
      return NextResponse.json({ error: "Sponsor organization not found" }, { status: 400 })
    }

    const applications = await prisma.driver_Application.findMany({
      where: {
        Org_ID: sponsor.Org_ID,
      },
      include: {
        User: {
          select: {
            User_ID: true,
            Username: true,
            Email: true,
            Phone: true,
            Date_Added: true,
          },
        },
      },
      orderBy: {
        Application_Date: "desc",
      },
    })

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
