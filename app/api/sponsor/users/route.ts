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
    console.log("Fetching drivers for orgId:", orgId);
    
    // First, get all driver-org associations for this org
    const driverOrgAssociations = await prisma.driver_Sponsor_Org.findMany({
      where: { Org_ID: orgId },
      select: { User_ID: true, Point_Count: true, Org_ID: true },
    });

    console.log("Driver-org associations:", driverOrgAssociations);

    // Get the User_IDs from those associations
    const driverUserIds = driverOrgAssociations.map(a => a.User_ID);

    // Now fetch the user details for those drivers
    const drivers = await prisma.user.findMany({
      where: {
        User_ID: { in: driverUserIds },
      },
      select: {
        User_ID: true,
        Username: true,
        Status: true,
      },
      orderBy: {
        Username: "asc",
      },
    });

    // Enrich the drivers with their points for this org
    const driversWithPoints = drivers.map(driver => ({
      ...driver,
      Driver: {
        Driver_Sponsor_Org: driverOrgAssociations.filter(a => a.User_ID === driver.User_ID),
      },
    }));

    // Find all sponsors in my org
    const sponsorUsers = await prisma.sponsor.findMany({
      where: { Org_ID: orgId },
      select: { User_ID: true },
    });

    const sponsorUserIds = sponsorUsers.map(s => s.User_ID);

    // Fetch sponsor user details
    const sponsors = await prisma.user.findMany({
      where: {
        User_ID: { in: sponsorUserIds },
      },
      select: {
        User_ID: true,
        Username: true,
        Status: true,
      },
      orderBy: {
        Username: "asc",
      },
    });

    // Combine drivers and sponsors into a single list
    const allUsers = [...driversWithPoints, ...sponsors];

    console.log("Users fetched successfully:", allUsers);

    return NextResponse.json(
      {
        message: "Successfully fetched all users in this sponsor org.",
        drivers: allUsers,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Driver fetch error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}