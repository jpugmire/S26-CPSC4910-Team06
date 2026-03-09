// app/api/sponsor/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await req.json()
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 400 })
    }

    if (session?.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized" }, { status: 400 })
    }

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

    const applicationId = parseInt(id)
    const application = await prisma.driver_Application.findUnique({
      where: { Application_ID: applicationId },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 400 })
    }

    if (application.Org_ID !== sponsor.Org_ID) {
      return NextResponse.json({ error: "Not authorized to review this application" }, { status: 400 })
    }

    if (application.Status !== "P") {
      return NextResponse.json({ error: "Application already reviewed" }, { status: 400 })
    }

    const updatedApplication = await prisma.driver_Application.update({
      where: { Application_ID: applicationId },
      data: {
        Status: status,
        Review_Date: new Date(),
      },
    })

    if (status === "A") {
      await prisma.driver.update({
        where: { User_ID: application.User_ID },
        data: {
          Org_ID: sponsor.Org_ID,
        },
      })
    }

    return NextResponse.json(
      { message: status === "A" ? "Application approved" : "Application rejected", application: updatedApplication },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing application:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
