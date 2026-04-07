import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "D") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const driver = await prisma.driver.findUnique({
      where: { User_ID: userId },
      include: {
        driverSponsorOrgs: true,
      },
    })

    const driverOrg = driver?.driverSponsorOrgs[0]

    if (!driverOrg) {
      return NextResponse.json(
        { error: "Driver not associated with an organization." },
        { status: 400 }
      )
    }

    const totalCost = items.reduce(
      (sum: number, item: any) => sum + (item.Point_Price ?? 0),
      0
    )

    if (driverOrg.Point_Count < totalCost) {
      return NextResponse.json(
        { error: "Not enough points." },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.driver_Sponsor_Org.update({
        where: {
          User_ID_Org_ID: {
            User_ID: userId,
            Org_ID: driverOrg.Org_ID,
          },
        },
        data: {
          Point_Count: {
            decrement: totalCost,
          },
        },
      })

      for (const item of items) {
        await tx.point_Transaction.create({
          data: {
            User_ID: userId,
            Item_ID: item.Item_ID,
            Price: item.Point_Price!,
          },
        })
      }
    })

    return NextResponse.json({
      message: "Purchase successful!",
    })
  } catch (error) {
    console.error("Cart purchase error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}