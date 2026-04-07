// app/api/sponsor/applications/bulk/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized" }, { status: 400 })
    }

    const { status } = await req.json()

    if (!["A", "R"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'A' (Approved) or 'R' (Rejected)" },
        { status: 400 }
      )
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: parseInt(session.user.id) },
    })

    if (!sponsor || !sponsor.Org_ID) {
      return NextResponse.json({ error: "Sponsor organization not found" }, { status: 400 })
    }

    const pendingApplications = await prisma.driver_Application.findMany({
      where: {
        Org_ID: sponsor.Org_ID,
        Status: "P",
      },
    })

    if (pendingApplications.length === 0) {
      return NextResponse.json({ error: "No pending applications to process" }, { status: 400 })
    }

    const now = new Date()
    let processed = 0

    for (const application of pendingApplications) {
      try {
        await prisma.driver_Application.update({
          where: { Application_ID: application.Application_ID },
          data: {
            Status: status,
            Review_Date: now,
          },
        })

        if (status === "A") {
          const existingMembership = await prisma.driver_Sponsor_Org.findUnique({
            where: {
              User_ID_Org_ID: {
                User_ID: application.User_ID,
                Org_ID: sponsor.Org_ID!,
              },
            },
          })

          if (!existingMembership) {
            await prisma.driver_Sponsor_Org.create({
              data: {
                User_ID: application.User_ID,
                Org_ID: sponsor.Org_ID!,
                Point_Count: 0,
              },
            })
          }
        }

        processed++
      } catch (error) {
        console.error(`Failed to process application ${application.Application_ID}:`, error)
      }
    }

    return NextResponse.json(
      {
        message: status === "A" 
          ? `Approved ${processed} application(s)` 
          : `Rejected ${processed} application(s)`,
        processed,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing bulk applications:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}