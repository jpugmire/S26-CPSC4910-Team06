import { GET, POST, PATCH, DELETE } from "@/app/api/admin/driver-affiliations/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

jest.mock("@/lib/prisma", () => ({
    prisma: {
        driver: {
            findUnique: jest.fn()
        },
        sponsor_Org: {
            findUnique: jest.fn()
        },
        driver_Sponsor_Org: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        audit: {
            create: jest.fn()
        }
    }
}))

const baseUrl = "http://localhost/api/admin/driver-affiliations"

const mockAffiliations = [
    {
        User_ID: 100,
        Org_ID: 10,
        Point_Count: 500,
        Sponsor_Org: { Org_ID: 10, Org_Name: "Test Org" },
        Driver: { User: { User_ID: 100, Username: "driver1", Email: "driver1@test.com" } }
    },
    {
        User_ID: 101,
        Org_ID: 11,
        Point_Count: 300,
        Sponsor_Org: { Org_ID: 11, Org_Name: "Another Org" },
        Driver: { User: { User_ID: 101, Username: "driver2", Email: "driver2@test.com" } }
    }
]

describe("GET /api/admin/driver-affiliations", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("rejects non-admin users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("returns affiliations for admin", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver_Sponsor_Org.findMany as jest.Mock).mockResolvedValue(mockAffiliations)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.affiliations).toHaveLength(2)
        expect(data.affiliations[0].Driver_Username).toBe("driver1")
    })
})

describe("POST /api/admin/driver-affiliations", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("returns error when userId or orgId missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ userId: 100 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("User ID and Organization ID are required.")
    })

    it("returns error when driver not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Driver not found.")
    })

    it("returns error when org not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue({ User_ID: 100 })
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Organization not found.")
    })

    it("returns error when affiliation already exists", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue({ User_ID: 100 })
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue({ Org_ID: 10, Org_Name: "Test" })
        ;(prisma.driver_Sponsor_Org.findUnique as jest.Mock).mockResolvedValue({ User_ID: 100, Org_ID: 10 })

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Driver is already affiliated with this organization.")
    })

    it("successfully creates affiliation", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue({ User_ID: 100 })
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue({ Org_ID: 10, Org_Name: "Test" })
        ;(prisma.driver_Sponsor_Org.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.driver_Sponsor_Org.create as jest.Mock).mockResolvedValue({
            User_ID: 100,
            Org_ID: 10,
            Point_Count: 0,
            Sponsor_Org: { Org_Name: "Test" },
            Driver: { User: { Username: "driver1" } }
        })
        ;(prisma.audit.create as jest.Mock).mockResolvedValue({})

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("Driver affiliation created successfully.")
    })
})

describe("PATCH /api/admin/driver-affiliations", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await PATCH(new NextRequest(baseUrl, {
            method: "PATCH",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("returns error when affiliation not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver_Sponsor_Org.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await PATCH(new NextRequest(baseUrl, {
            method: "PATCH",
            body: JSON.stringify({ userId: 100, orgId: 10, pointCount: 500 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Driver affiliation not found.")
    })

    it("successfully updates point count", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver_Sponsor_Org.findUnique as jest.Mock).mockResolvedValue({
            User_ID: 100,
            Org_ID: 10,
            Point_Count: 500
        })
        ;(prisma.driver_Sponsor_Org.update as jest.Mock).mockResolvedValue({
            User_ID: 100,
            Org_ID: 10,
            Point_Count: 750,
            Sponsor_Org: { Org_Name: "Test" }
        })
        ;(prisma.audit.create as jest.Mock).mockResolvedValue({})

        const response = await PATCH(new NextRequest(baseUrl, {
            method: "PATCH",
            body: JSON.stringify({ userId: 100, orgId: 10, pointCount: 750 })
        }))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.affiliation.Point_Count).toBe(750)
    })
})

describe("DELETE /api/admin/driver-affiliations", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await DELETE(new NextRequest(baseUrl, {
            method: "DELETE",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("returns error when affiliation not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver_Sponsor_Org.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await DELETE(new NextRequest(baseUrl, {
            method: "DELETE",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Driver affiliation not found.")
    })

    it("successfully deletes affiliation", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.driver_Sponsor_Org.findUnique as jest.Mock).mockResolvedValue({
            User_ID: 100,
            Org_ID: 10,
            Sponsor_Org: { Org_Name: "Test" },
            Driver: { User: { Username: "driver1" } }
        })
        ;(prisma.driver_Sponsor_Org.delete as jest.Mock).mockResolvedValue({})
        ;(prisma.audit.create as jest.Mock).mockResolvedValue({})

        const response = await DELETE(new NextRequest(baseUrl, {
            method: "DELETE",
            body: JSON.stringify({ userId: 100, orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe("Driver affiliation removed successfully.")
    })
})
