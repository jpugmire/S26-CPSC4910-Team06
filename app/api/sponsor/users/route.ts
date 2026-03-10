// app/api/sponsor/users/route.ts
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

    if (session?.user?.role !== 'S') {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 400 }
      )
    }

    // Get sponsor user's org ID.
    const sponsor = await prisma.sponsor.findUnique({
        where: { User_ID: Number(session.user.id) },
        select: { Org_ID: true },
    })
    const orgId = sponsor?.Org_ID
    if (!orgId) {
        return NextResponse.json({ error: "Sponsor has no Org_ID" }, { status: 400 })
    }

    // Find all drivers in my org.
    const drivers = await prisma.user.findMany({
  where: {
    Driver: {
      driverSponsorOrgs: {
        some: {
          Org_ID: orgId,
        },
      },
    },
  },
  select: {
    User_ID: true,
    Username: true,
    Status: true,
    Driver: {
      select: {
        driverSponsorOrgs: {
          where: {
            Org_ID: orgId,
          },
          select: {
            Org_ID: true,
            Point_Count: true,
          },
        },
      },
    },
  },
  orderBy: {
    Username: "asc",
  },
})

console.log(drivers);

    return NextResponse.json(
      {
        message: "Successfully fetched all drivers in this sponsor org.",
        drivers: drivers,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Driver fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}