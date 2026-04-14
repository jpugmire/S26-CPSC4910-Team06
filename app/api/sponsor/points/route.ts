// app/api/sponsor/points/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { sendPointsChangedEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { driverId, pointValue, reason } = await req.json()
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

    if (!driverId || pointValue === undefined || pointValue === null ) {
      return NextResponse.json(
        { error: "Driver ID and Point Value required." },
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

    // Update driver's points (trigger will create audit log)
    const driver = await prisma.driver_Sponsor_Org.update({
        where:
        {
            User_ID_Org_ID: {
              User_ID: driverId,
              Org_ID: orgId
            }
        },
        data:
        {
            Point_Count: {increment: pointValue},
        },
    })

    // Create audit log entry with the reason
    await prisma.audit.create({
      data: {
        User_ID: driverId,
        Message: `User points changed from ${driver.Point_Count - pointValue} to ${driver.Point_Count}`,
        Message_Type_ID: 5, // User Points Changed
        Note: reason || null,
      },
    })

    const driverUser = await prisma.user.findUnique({
      where: { User_ID: driverId },
      select: { Email: true, Username: true, notificationsEnabled: true },
    })

    if (driverUser?.notificationsEnabled && driverUser.Email) {
      sendPointsChangedEmail(
        driverUser.Email,
        driverUser.Username,
        pointValue,
        driver.Point_Count,
        reason
      ).catch(() => {})
    }

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
