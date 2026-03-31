import { POST } from "@/app/api/sponsor/points/route"
import { NextRequest } from "next/server"

// Mock auth
jest.mock("@/auth", () => ({ auth: jest.fn() }))
import { auth } from "@/auth"
const mockAuth = auth as jest.Mock

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    sponsor: { findUnique: jest.fn() },
    driver_Sponsor_Org: { update: jest.fn() },
  },
}))
import { prisma } from "@/lib/prisma"
const mockSponsor = prisma.sponsor.findUnique as jest.Mock
const mockDriverSponsorOrg = prisma.driver_Sponsor_Org.update as jest.Mock

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/sponsor/points", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

describe("POST /api/sponsor/points", () => {
  beforeEach(() => jest.clearAllMocks())

  it("rejects unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeRequest({ driverId: 1, pointValue: 10 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Not logged in.")
  })

  it("rejects non-sponsor users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    const res = await POST(makeRequest({ driverId: 1, pointValue: 10 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Not authorized.")
  })

  it("rejects missing driverId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
    const res = await POST(makeRequest({ pointValue: 10 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Driver ID and Point Value required.")
  })

  it("rejects missing pointValue", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
    const res = await POST(makeRequest({ driverId: 1 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Driver ID and Point Value required.")
  })

  it("rejects if sponsor has no org", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
    mockSponsor.mockResolvedValue({ Org_ID: null })
    const res = await POST(makeRequest({ driverId: 1, pointValue: 10 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Sponsor has no Org_ID")
  })

  it("adds points to a driver successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
    mockSponsor.mockResolvedValue({ Org_ID: 5 })
    mockDriverSponsorOrg.mockResolvedValue({ User_ID: 2, Org_ID: 5, Point_Count: 110 })
    const res = await POST(makeRequest({ driverId: 2, pointValue: 10 }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.message).toBe("Driver points updated successfully.")
    expect(data.driverId).toBe(2)
    expect(mockDriverSponsorOrg).toHaveBeenCalledWith(expect.objectContaining({
      data: { Point_Count: { increment: 10 } },
    }))
  })

  it("removes points from a driver using a negative value", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
    mockSponsor.mockResolvedValue({ Org_ID: 5 })
    mockDriverSponsorOrg.mockResolvedValue({ User_ID: 2, Org_ID: 5, Point_Count: 90 })
    const res = await POST(makeRequest({ driverId: 2, pointValue: -10 }))
    expect(res.status).toBe(201)
    expect(mockDriverSponsorOrg).toHaveBeenCalledWith(expect.objectContaining({
      data: { Point_Count: { increment: -10 } },
    }))
  })

  it("handles database errors", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
    mockSponsor.mockResolvedValue({ Org_ID: 5 })
    mockDriverSponsorOrg.mockRejectedValue(new Error("DB error"))
    const res = await POST(makeRequest({ driverId: 2, pointValue: 10 }))
    expect(res.status).toBe(500)
  })
})
