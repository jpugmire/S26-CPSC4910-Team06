import { GET, PUT } from "@/app/api/user/[userId]/route"
import { NextRequest } from "next/server"

jest.mock("@/auth", () => ({ auth: jest.fn() }))
import { auth } from "@/auth"
const mockAuth = auth as jest.Mock

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sponsor: { findUnique: jest.fn() },
    driver: { findUnique: jest.fn() },
  },
}))
import { prisma } from "@/lib/prisma"
const mockUserFind = prisma.user.findUnique as jest.Mock
const mockUserUpdate = prisma.user.update as jest.Mock
const mockSponsorFind = prisma.sponsor.findUnique as jest.Mock
const mockDriverFind = prisma.driver.findUnique as jest.Mock

function makeGetRequest(userId: string) {
  return new NextRequest(`http://localhost/api/user/${userId}`)
}

function makePutRequest(userId: string, body: object) {
  return new NextRequest(`http://localhost/api/user/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

const params = (userId: string) => Promise.resolve({ userId })

const mockDriverUser = {
  User_ID: 2,
  Username: "testdriver",
  Email: "driver@test.com",
  Phone: "555-1234",
  User_Type: "D",
  twoFactorEnabled: false,
  Driver: {
    driverSponsorOrgs: [
      { Org_ID: 5, Sponsor_Org: { Org_ID: 5, Org_Name: "Test Org" } },
    ],
  },
  Sponsor: null,
}

describe("GET /api/user/[userId]", () => {
  beforeEach(() => jest.clearAllMocks())

  it("rejects unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(makeGetRequest("2"), { params: params("2") })
    expect(res.status).toBe(401)
  })

  it("rejects invalid user ID", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    const res = await GET(makeGetRequest("abc"), { params: params("abc") })
    expect(res.status).toBe(400)
  })

  it("returns 404 if user not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    mockUserFind.mockResolvedValue(null)
    const res = await GET(makeGetRequest("99"), { params: params("99") })
    expect(res.status).toBe(404)
  })

  it("allows admin to view any user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    mockUserFind.mockResolvedValue(mockDriverUser)
    const res = await GET(makeGetRequest("2"), { params: params("2") })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.Username).toBe("testdriver")
  })

  it("allows a user to view their own account", async () => {
    mockAuth.mockResolvedValue({ user: { id: "2", role: "D" } })
    mockUserFind.mockResolvedValue(mockDriverUser)
    const res = await GET(makeGetRequest("2"), { params: params("2") })
    expect(res.status).toBe(200)
  })

  it("allows sponsor to view driver in their org", async () => {
    mockAuth.mockResolvedValue({ user: { id: "10", role: "S" } })
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockDriverFind.mockResolvedValue({
      driverSponsorOrgs: [{ Org_ID: 5 }],
    })
    mockUserFind.mockResolvedValue(mockDriverUser)
    const res = await GET(makeGetRequest("2"), { params: params("2") })
    expect(res.status).toBe(200)
  })

  it("rejects sponsor viewing driver from a different org", async () => {
    mockAuth.mockResolvedValue({ user: { id: "10", role: "S" } })
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockDriverFind.mockResolvedValue({
      driverSponsorOrgs: [{ Org_ID: 99 }],
    })
    const res = await GET(makeGetRequest("2"), { params: params("2") })
    expect(res.status).toBe(403)
  })
})

describe("PUT /api/user/[userId]", () => {
  beforeEach(() => jest.clearAllMocks())

  it("rejects unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(makePutRequest("2", { email: "new@test.com", phone: "555-0000" }), { params: params("2") })
    expect(res.status).toBe(401)
  })

  it("allows a driver to update their own account", async () => {
    mockAuth.mockResolvedValue({ user: { id: "2", role: "D" } })
    mockUserUpdate.mockResolvedValue({ Username: "testdriver", Email: "new@test.com", Phone: "555-0000" })
    const res = await PUT(makePutRequest("2", { email: "new@test.com", phone: "555-0000" }), { params: params("2") })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.Email).toBe("new@test.com")
  })

  it("allows admin to update any user's account", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    mockUserUpdate.mockResolvedValue({ Username: "testdriver", Email: "updated@test.com", Phone: "555-9999" })
    const res = await PUT(makePutRequest("2", { email: "updated@test.com", phone: "555-9999" }), { params: params("2") })
    expect(res.status).toBe(200)
  })

  it("allows sponsor to update driver in their org", async () => {
    mockAuth.mockResolvedValue({ user: { id: "10", role: "S" } })
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockDriverFind.mockResolvedValue({
      driverSponsorOrgs: [{ Org_ID: 5 }],
    })
    mockUserUpdate.mockResolvedValue({ Username: "testdriver", Email: "sponsor-updated@test.com", Phone: "555-1111" })
    const res = await PUT(makePutRequest("2", { email: "sponsor-updated@test.com", phone: "555-1111" }), { params: params("2") })
    expect(res.status).toBe(200)
  })

  it("rejects sponsor updating driver from a different org", async () => {
    mockAuth.mockResolvedValue({ user: { id: "10", role: "S" } })
    mockSponsorFind.mockResolvedValue({ Org_ID: 5 })
    mockDriverFind.mockResolvedValue({
      driverSponsorOrgs: [{ Org_ID: 99 }],
    })
    const res = await PUT(makePutRequest("2", { email: "x@test.com", phone: "555-0000" }), { params: params("2") })
    expect(res.status).toBe(403)
  })

  it("handles database errors", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
    mockUserUpdate.mockRejectedValue(new Error("DB error"))
    const res = await PUT(makePutRequest("2", { email: "x@test.com", phone: "555-0000" }), { params: params("2") })
    expect(res.status).toBe(500)
  })
})
