import { POST as POST_DRIVER } from "@/app/api/sponsor/register/driver/route"
import { POST as POST_SPONSOR } from "@/app/api/sponsor/register/sponsor/route"
import { NextRequest } from "next/server"

// Mock auth
jest.mock("@/auth", () => ({ auth: jest.fn() }))
import { auth } from "@/auth"
const mockAuth = auth as jest.Mock

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    sponsor: { findUnique: jest.fn() },
  },
}))
import { prisma } from "@/lib/prisma"
const mockSponsorFind = prisma.sponsor.findUnique as jest.Mock

// Mock registerUser
jest.mock("@/lib/registerUser", () => ({ registerUser: jest.fn() }))
import { registerUser } from "@/lib/registerUser"
const mockRegisterUser = registerUser as jest.Mock

function makeRequest(url: string, body: object) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

const sponsorSession = { user: { id: "1", role: "S" } }

// ─── POST /api/sponsor/register/driver ────────────────────────────────────────

describe("POST /api/sponsor/register/driver", () => {
  const url = "http://localhost/api/sponsor/register/driver"
  beforeEach(() => jest.clearAllMocks())

  it("rejects unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST_DRIVER(makeRequest(url, { username: "newdriver", password: "pass123" }))
    expect(res.status).toBe(401)
  })

  it("rejects non-sponsor users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    const res = await POST_DRIVER(makeRequest(url, { username: "newdriver", password: "pass123" }))
    expect(res.status).toBe(403)
    expect((await res.json()).error).toBe("Not authorized.")
  })

  it("rejects missing username", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    const res = await POST_DRIVER(makeRequest(url, { password: "pass123" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Username and password are required.")
  })

  it("rejects missing password", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    const res = await POST_DRIVER(makeRequest(url, { username: "newdriver" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Username and password are required.")
  })

  it("rejects if sponsor has no org", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: null })
    const res = await POST_DRIVER(makeRequest(url, { username: "newdriver", password: "pass123" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Sponsor has no organization.")
  })

  it("creates a driver and immediately enrolls them in the org", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockRegisterUser.mockResolvedValue({ User_ID: 10 })
    const res = await POST_DRIVER(makeRequest(url, { username: "newdriver", password: "pass123" }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.message).toBe("Driver created successfully.")
    expect(data.userId).toBe(10)
    expect(mockRegisterUser).toHaveBeenCalledWith({
      username: "newdriver",
      password: "pass123",
      userType: "D",
      sponsorOrgId: 5,
    })
  })

  it("returns 400 when username already exists", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockRegisterUser.mockRejectedValue(new Error("Username already exists"))
    const res = await POST_DRIVER(makeRequest(url, { username: "taken", password: "pass123" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Username already exists")
  })

  it("returns 500 on unexpected database error", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockRegisterUser.mockRejectedValue(new Error("DB error"))
    const res = await POST_DRIVER(makeRequest(url, { username: "newdriver", password: "pass123" }))
    expect(res.status).toBe(500)
  })
})

// ─── POST /api/sponsor/register/sponsor ───────────────────────────────────────

describe("POST /api/sponsor/register/sponsor", () => {
  const url = "http://localhost/api/sponsor/register/sponsor"
  beforeEach(() => jest.clearAllMocks())

  it("rejects unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST_SPONSOR(makeRequest(url, { username: "newsponsor", password: "pass123" }))
    expect(res.status).toBe(401)
  })

  it("rejects non-sponsor users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })
    const res = await POST_SPONSOR(makeRequest(url, { username: "newsponsor", password: "pass123" }))
    expect(res.status).toBe(403)
    expect((await res.json()).error).toBe("Not authorized.")
  })

  it("rejects missing username", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    const res = await POST_SPONSOR(makeRequest(url, { password: "pass123" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Username and password are required.")
  })

  it("rejects missing password", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    const res = await POST_SPONSOR(makeRequest(url, { username: "newsponsor" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Username and password are required.")
  })

  it("rejects if sponsor has no org", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: null })
    const res = await POST_SPONSOR(makeRequest(url, { username: "newsponsor", password: "pass123" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Sponsor has no organization.")
  })

  it("creates a sponsor user in the same org", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockRegisterUser.mockResolvedValue({ User_ID: 11 })
    const res = await POST_SPONSOR(makeRequest(url, { username: "newsponsor", password: "pass123" }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.message).toBe("Sponsor created successfully.")
    expect(data.userId).toBe(11)
    expect(mockRegisterUser).toHaveBeenCalledWith({
      username: "newsponsor",
      password: "pass123",
      userType: "S",
      sponsorOrgId: 5,
    })
  })

  it("returns 400 when username already exists", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockRegisterUser.mockRejectedValue(new Error("Username already exists"))
    const res = await POST_SPONSOR(makeRequest(url, { username: "taken", password: "pass123" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Username already exists")
  })

  it("returns 500 on unexpected database error", async () => {
    mockAuth.mockResolvedValue(sponsorSession)
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockRegisterUser.mockRejectedValue(new Error("DB error"))
    const res = await POST_SPONSOR(makeRequest(url, { username: "newsponsor", password: "pass123" }))
    expect(res.status).toBe(500)
  })
})
