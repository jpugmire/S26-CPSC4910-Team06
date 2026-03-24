// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { registerUser } from "@/lib/registerUser";

export async function POST(req: NextRequest) {
  try {
    const { username, password, userType, sponsorOrgId } = await req.json();
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 });
    }

    if (session.user?.role !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 });
    }

    const user = await registerUser({
      username,
      password,
      userType,
      sponsorOrgId: sponsorOrgId ? Number(sponsorOrgId) : undefined,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user.User_ID,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      },
      { status: 500 }
    );
  }
}