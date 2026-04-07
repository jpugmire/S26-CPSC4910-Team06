// app/api/driver/application/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
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

    const applications = await prisma.driver_Application.findMany({
      where: { User_ID: parseInt(session.user.id) },
      include: {
        Sponsor_Org: {
          select: {
            Org_ID: true,
            Org_Name: true,
          },
        },
      },
      orderBy: { Application_Date: "desc" },
    })

    const joinedOrgs = await prisma.driver_Sponsor_Org.findMany({
      where: { User_ID: parseInt(session.user.id) },
      include: {
        Sponsor_Org: {
          select: {
            Org_ID: true,
            Org_Name: true,
          },
        },
      },
    })

    const approvedApplications = await prisma.driver_Application.findMany({
      where: {
        User_ID: parseInt(session.user.id),
        Status: "A",
      },
      select: {
        Org_ID: true,
        Review_Date: true,
      },
    })

    const joinedOrganizations = joinedOrgs.map((j: typeof joinedOrgs[0]) => {
      const approvedApp = approvedApplications.find((a: typeof approvedApplications[0]) => a.Org_ID === j.Org_ID)
      return {
        Org_ID: j.Org_ID,
        Org_Name: j.Sponsor_Org.Org_Name,
        Point_Count: j.Point_Count,
        joinedDate: approvedApp?.Review_Date ?? null,
      }
    })

    return NextResponse.json({
      pendingApplications: applications.filter((a: typeof applications[0]) => a.Status === "P"),
      pastApplications: applications.filter((a: typeof applications[0]) => a.Status !== "P"),
      joinedOrganizations,
    }, { status: 200 })
  } catch (error) {
    console.error("Error checking driver application status:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

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

    const driver = await prisma.driver.findUnique({
      where: { User_ID: parseInt(session.user.id) },
    })

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 400 })
    }

    const existingApplication = await prisma.driver_Application.findFirst({
      where: {
        User_ID: parseInt(session.user.id),
        Org_ID: orgId,
        Status: "P",
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You already have a pending application to this organization" }, { status: 400 })
    }

    const alreadyJoined = await prisma.driver_Sponsor_Org.findFirst({
      where: {
        User_ID: parseInt(session.user.id),
        Org_ID: orgId,
      },
    })

    if (alreadyJoined) {
      return NextResponse.json({ error: "You are already part of this organization" }, { status: 400 })
    }

    const org = await prisma.sponsor_Org.findUnique({
      where: { Org_ID: orgId },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 })
    }

    const application = await prisma.driver_Application.create({
      data: {
        User_ID: parseInt(session.user.id),
        Org_ID: orgId,
        Status: "P",
      },
    })

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    }, { status: 201 })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
