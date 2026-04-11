import { GET } from "@/app/api/driver/organizations/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

jest.mock("@/lib/prisma", () => ({
    prisma: {
        driver_Sponsor_Org: {
            findMany: jest.fn()
        },
        sponsor_Org: {
            findMany: jest.fn()
        }
    }
}))

const mockDriverSponsorOrg = prisma.driver_Sponsor_Org.findMany as jest.Mock

const baseUrl = "http://localhost/api/driver/organizations"

const mockOrganizations = [
    { Org_ID: 1, Org_Name: "Acme Corp" },
    { Org_ID: 2, Org_Name: "Beta Inc" },
    { Org_ID: 3, Org_Name: "Gamma LLC" }
]

describe("GET /api/driver/organizations", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized")
    })

    it("rejects non-driver users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized")
    })

    it("rejects admin users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized")
    })

    it("returns all organizations for authenticated driver", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })
        mockDriverSponsorOrg.mockResolvedValue([
            { Org_ID: 1 },
            { Org_ID: 2 },
            { Org_ID: 3 }
        ])
        ;(prisma.sponsor_Org.findMany as jest.Mock).mockResolvedValue(mockOrganizations)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.organizations).toHaveLength(3)
        expect(data.organizations[0].Org_Name).toBe("Acme Corp")
    })

    it("returns empty array when no organizations exist", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })
        mockDriverSponsorOrg.mockResolvedValue([])
        ;(prisma.sponsor_Org.findMany as jest.Mock).mockResolvedValue([])

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.organizations).toHaveLength(0)
    })

    it("only returns organizations the driver belongs to", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })
        mockDriverSponsorOrg.mockResolvedValue([
            { Org_ID: 1 },
            { Org_ID: 3 }
        ])
        ;(prisma.sponsor_Org.findMany as jest.Mock).mockResolvedValue([
            { Org_ID: 1, Org_Name: "Acme Corp" },
            { Org_ID: 3, Org_Name: "Gamma LLC" }
        ])

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.organizations).toHaveLength(2)
        expect(data.organizations).not.toContainEqual({ Org_ID: 2, Org_Name: "Beta Inc" })
        // Verify the where clause filters by the org IDs the driver belongs to
        expect(prisma.sponsor_Org.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                Org_ID: {
                    in: [1, 3]
                }
            }
        }))
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })
        mockDriverSponsorOrg.mockRejectedValue(new Error("DB error"))

        const response = await GET(new NextRequest(baseUrl))

        expect(response.status).toBe(500)
    })
})
