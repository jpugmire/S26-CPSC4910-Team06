// app/api/sponsor/conversion/route.ts
import { NextRequest, NextResponse } from "next/server"
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
    const conversion = await prisma.sponsor_Org.findUnique({
    where: {
      Org_ID: orgId
    },
    select: {
      Point_Dollar_Value: true
    }
  })

    return NextResponse.json(
      {
        message: "Successfully fetched conversion rate.",
        conversion: conversion,
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

export async function POST(req: NextRequest) {
  try {
    const { conversion } = await req.json()
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

    const sponsor = await prisma.sponsor.findUnique({
        where: { User_ID: Number(session.user.id) },
        select: { Org_ID: true },
    })
    const orgId = sponsor?.Org_ID
    if (!orgId) {
        return NextResponse.json({ error: "Sponsor has no Org_ID" }, { status: 400 })
    }

    if (!orgId || !conversion ) {
      return NextResponse.json(
        { error: "Org ID and conversion rate required." },
        { status: 400 }
      )
    }



    return NextResponse.json(
      {
        message: "Point conversion rate updated successfully.",
        conversion: conversion,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Point conversion rate update error:", error)
    return NextResponse.json(
      { error: "An error occurred during point conversion rate update." },
      { status: 500 }
    )
  }
}
