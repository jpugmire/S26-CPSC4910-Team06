import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = {
    params: Promise<{ userId: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const session = await auth()

    if(!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { userId } = await params
    
    //only the user can change their 2fa setting
    if (session.user.id !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { enabled } = await req.json()

    const updated = await prisma.user.update({
        where: { User_ID: Number(userId) },
        data: { twoFactorEnabled: enabled },
        select: { twoFactorEnabled: true }
    })

    return NextResponse.json(updated)
}