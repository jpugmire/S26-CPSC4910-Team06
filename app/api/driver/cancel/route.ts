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
    const { transactionId } = await req.json()

    const transaction = await prisma.point_Transaction.findUnique({
      where: { Transaction_ID: transactionId },
    })

    if (!transaction || transaction.User_ID !== userId) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    const driver = await prisma.driver.findUnique({
      where: { User_ID: userId },
      include: {
        Driver_Sponsor_Org: true,
      },
    })

    const driverOrg = driver?.Driver_Sponsor_Org[0]

    if (!driverOrg) {
      return NextResponse.json(
        { error: "Driver org not found" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // 1. Refund points
      await tx.driver_Sponsor_Org.update({
        where: {
          User_ID_Org_ID: {
            User_ID: userId,
            Org_ID: driverOrg.Org_ID,
          },
        },
        data: {
          Point_Count: {
            increment: Number(transaction.Price),
          },
        },
      })

      // 2. Delete transaction
      await tx.point_Transaction.delete({
        where: { Transaction_ID: transactionId },
      })
    })

    return NextResponse.json({
      message: "Purchase canceled and points refunded",
    })
  } catch (error) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}