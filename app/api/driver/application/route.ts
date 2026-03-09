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

    if (driver.Org_ID) {
      return NextResponse.json({ 
        message: "You are already part of an organization",
        status: "joined",
        orgId: driver.Org_ID
      }, { status: 200 })
    }

    const applications = await prisma.driver_Application.findMany({
      where: { User_ID: parseInt(session.user.id) },
      orderBy: { Application_Date: "desc" },
    })

    const pendingApplication = applications.find(a => a.Status === "P")
    
    if (pendingApplication) {
      return NextResponse.json({
        status: "pending",
        application: pendingApplication,
        message: "You have a pending application"
      }, { status: 200 })
    }

    return NextResponse.json({
      status: "can_apply",
      message: "You can apply to an organization"
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

    if (driver.Org_ID) {
      return NextResponse.json({ error: "You are already part of an organization" }, { status: 400 })
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
