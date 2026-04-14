// app/api/admin/driver-affiliations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const orgIdParam = req.nextUrl.searchParams.get("orgId")
    const orgId = orgIdParam ? Number(orgIdParam) : undefined

    const affiliations = await prisma.driver_Sponsor_Org.findMany({
      where: orgId ? { Org_ID: orgId } : undefined,
      include: {
        Sponsor_Org: {
          select: {
            Org_ID: true,
            Org_Name: true,
          },
        },
        Driver: {
          include: {
            User: {
              select: {
                User_ID: true,
                Username: true,
                Email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { Org_ID: "asc" },
        { User_ID: "asc" },
      ],
    })

    const result = affiliations.map((aff) => ({
      User_ID: aff.User_ID,
      Org_ID: aff.Org_ID,
      Org_Name: aff.Sponsor_Org.Org_Name,
      Point_Count: aff.Point_Count,
      Driver_Username: aff.Driver.User.Username,
      Driver_Email: aff.Driver.User.Email,
    }))

    return NextResponse.json({ affiliations: result }, { status: 200 })
  } catch (error) {
    console.error("Error fetching driver affiliations:", error)
    return NextResponse.json({ error: "An error occurred." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { userId, orgId } = await req.json()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "User ID and Organization ID are required." },
        { status: 400 }
      )
    }

    const driver = await prisma.driver.findUnique({
      where: { User_ID: userId },
    })

    if (!driver) {
      return NextResponse.json({ error: "Driver not found." }, { status: 400 })
    }

    const org = await prisma.sponsor_Org.findUnique({
      where: { Org_ID: orgId },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found." }, { status: 400 })
    }

    const existing = await prisma.driver_Sponsor_Org.findUnique({
      where: {
        User_ID_Org_ID: {
          User_ID: userId,
          Org_ID: orgId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Driver is already affiliated with this organization." },
        { status: 400 }
      )
    }

    const affiliation = await prisma.driver_Sponsor_Org.create({
      data: {
        User_ID: userId,
        Org_ID: orgId,
        Point_Count: 0,
      },
      include: {
        Sponsor_Org: {
          select: {
            Org_Name: true,
          },
        },
        Driver: {
          include: {
            User: {
              select: {
                Username: true,
              },
            },
          },
        },
      },
    })

    await prisma.audit.create({
      data: {
        User_ID: userId,
        Message: `Driver ${affiliation.Driver.User.Username} added to organization ${affiliation.Sponsor_Org.Org_Name}`,
        Message_Type_ID: 10,
      },
    })

    return NextResponse.json(
      {
        message: "Driver affiliation created successfully.",
        affiliation: {
          User_ID: affiliation.User_ID,
          Org_ID: affiliation.Org_ID,
          Org_Name: affiliation.Sponsor_Org.Org_Name,
          Point_Count: affiliation.Point_Count,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating driver affiliation:", error)
    return NextResponse.json({ error: "An error occurred." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { userId, orgId, newOrgId, pointCount } = await req.json()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "User ID and current Organization ID are required." },
        { status: 400 }
      )
    }

    const existing = await prisma.driver_Sponsor_Org.findUnique({
      where: {
        User_ID_Org_ID: {
          User_ID: userId,
          Org_ID: orgId,
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Driver affiliation not found." },
        { status: 400 }
      )
    }

    const updateData: { Point_Count?: number; Org_ID?: number } = {}

    if (pointCount !== undefined) {
      updateData.Point_Count = pointCount
    }

    if (newOrgId && newOrgId !== orgId) {
      const newOrg = await prisma.sponsor_Org.findUnique({
        where: { Org_ID: newOrgId },
      })

      if (!newOrg) {
        return NextResponse.json(
          { error: "Target organization not found." },
          { status: 400 }
        )
      }

      const alreadyInTarget = await prisma.driver_Sponsor_Org.findUnique({
        where: {
          User_ID_Org_ID: {
            User_ID: userId,
            Org_ID: newOrgId,
          },
        },
      })

      if (alreadyInTarget) {
        return NextResponse.json(
          { error: "Driver is already affiliated with the target organization." },
          { status: 400 }
        )
      }

      await prisma.driver_Sponsor_Org.delete({
        where: {
          User_ID_Org_ID: {
            User_ID: userId,
            Org_ID: orgId,
          },
        },
      })

      const newAffiliation = await prisma.driver_Sponsor_Org.create({
        data: {
          User_ID: userId,
          Org_ID: newOrgId,
          Point_Count: pointCount ?? existing.Point_Count,
        },
        include: {
          Sponsor_Org: {
            select: {
              Org_Name: true,
            },
          },
        },
      })

      await prisma.audit.create({
        data: {
          User_ID: userId,
          Message: `Driver moved from organization ${orgId} to ${newOrgId} (${newAffiliation.Sponsor_Org.Org_Name})`,
          Message_Type_ID: 10,
        },
      })

      return NextResponse.json(
        {
          message: "Driver affiliation updated successfully.",
          affiliation: {
            User_ID: newAffiliation.User_ID,
            Org_ID: newAffiliation.Org_ID,
            Org_Name: newAffiliation.Sponsor_Org.Org_Name,
            Point_Count: newAffiliation.Point_Count,
          },
        },
        { status: 200 }
      )
    }

    const updated = await prisma.driver_Sponsor_Org.update({
      where: {
        User_ID_Org_ID: {
          User_ID: userId,
          Org_ID: orgId,
        },
      },
      data: updateData,
      include: {
        Sponsor_Org: {
          select: {
            Org_Name: true,
          },
        },
      },
    })

    await prisma.audit.create({
      data: {
        User_ID: userId,
        Message: `Driver point count updated from ${existing.Point_Count} to ${updated.Point_Count}`,
        Message_Type_ID: 10,
      },
    })

    return NextResponse.json(
      {
        message: "Driver affiliation updated successfully.",
        affiliation: {
          User_ID: updated.User_ID,
          Org_ID: updated.Org_ID,
          Org_Name: updated.Sponsor_Org.Org_Name,
          Point_Count: updated.Point_Count,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating driver affiliation:", error)
    return NextResponse.json({ error: "An error occurred." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const { userId, orgId } = await req.json()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "User ID and Organization ID are required." },
        { status: 400 }
      )
    }

    const existing = await prisma.driver_Sponsor_Org.findUnique({
      where: {
        User_ID_Org_ID: {
          User_ID: userId,
          Org_ID: orgId,
        },
      },
      include: {
        Sponsor_Org: {
          select: {
            Org_Name: true,
          },
        },
        Driver: {
          include: {
            User: {
              select: {
                Username: true,
              },
            },
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Driver affiliation not found." },
        { status: 400 }
      )
    }

    await prisma.driver_Sponsor_Org.delete({
      where: {
        User_ID_Org_ID: {
          User_ID: userId,
          Org_ID: orgId,
        },
      },
    })

    await prisma.audit.create({
      data: {
        User_ID: userId,
        Message: `Driver ${existing.Driver.User.Username} removed from organization ${existing.Sponsor_Org.Org_Name}`,
        Message_Type_ID: 10,
      },
    })

    return NextResponse.json(
      { message: "Driver affiliation removed successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error removing driver affiliation:", error)
    return NextResponse.json({ error: "An error occurred." }, { status: 500 })
  }
}
