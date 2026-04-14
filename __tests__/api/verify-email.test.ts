import { GET } from "@/app/api/auth/verify-email/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    email_Verification_Token: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}))

const baseUrl = "http://localhost/api/auth/verify-email"

function makeRequest(token?: string) {
  const url = token ? `${baseUrl}?token=${token}` : baseUrl
  return new NextRequest(url)
}

describe("GET /api/auth/verify-email", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 400 when token is missing", async () => {
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe("Token is required")
  })

  it("returns 400 when token does not exist", async () => {
    ;(prisma.email_Verification_Token.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await GET(makeRequest("nonexistent-token"))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe("Invalid or already used verification link")
  })

  it("returns 400 when token is expired", async () => {
    ;(prisma.email_Verification_Token.findUnique as jest.Mock).mockResolvedValue({
      token: "expired-token",
      userId: 1,
      expiresAt: new Date(Date.now() - 1000),
    })

    const res = await GET(makeRequest("expired-token"))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe("Verification link has expired")
  })

  it("marks user verified and deletes token on success", async () => {
    ;(prisma.email_Verification_Token.findUnique as jest.Mock).mockResolvedValue({
      token: "valid-token",
      userId: 42,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    })
    ;(prisma.user.update as jest.Mock).mockResolvedValue({})
    ;(prisma.email_Verification_Token.delete as jest.Mock).mockResolvedValue({})

    const res = await GET(makeRequest("valid-token"))

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { User_ID: 42 },
      data: { emailVerified: true },
    })
    expect(prisma.email_Verification_Token.delete).toHaveBeenCalledWith({
      where: { token: "valid-token" },
    })
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/login?verified=true")
  })

  it("does not update user when token is expired", async () => {
    ;(prisma.email_Verification_Token.findUnique as jest.Mock).mockResolvedValue({
      token: "expired-token",
      userId: 5,
      expiresAt: new Date(0),
    })

    await GET(makeRequest("expired-token"))

    expect(prisma.user.update).not.toHaveBeenCalled()
    expect(prisma.email_Verification_Token.delete).not.toHaveBeenCalled()
  })
})
