import { GET, POST } from "@/app/api/driver/application/route"
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
        driver_Application: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn()
        },
        driver_Sponsor_Org: {
            findMany: jest.fn(),
            findFirst: jest.fn()
        },
        sponsor_Org: {
            findUnique: jest.fn()
        }
    }
}))

const baseUrl = "http://localhost/api/driver/application"

const mockDriver = {
    User_ID: 100
}

const mockApplications = [
    {
        Application_ID: 1,
        User_ID: 100,
        Org_ID: 10,
        Status: "P",
        Application_Date: new Date("2024-01-01"),
        Review_Date: null,
        Sponsor_Org: {
            Org_ID: 10,
            Org_Name: "Test Org"
        }
    },
    {
        Application_ID: 2,
        User_ID: 100,
        Org_ID: 11,
        Status: "A",
        Application_Date: new Date("2024-01-02"),
        Review_Date: new Date("2024-01-03"),
        Sponsor_Org: {
            Org_ID: 11,
            Org_Name: "Approved Org"
        }
    }
]

const mockJoinedOrgs = [
    {
        User_ID: 100,
        Org_ID: 11,
        Point_Count: 500,
        Sponsor_Org: {
            Org_ID: 11,
            Org_Name: "Approved Org"
        }
    }
]

describe("GET /api/driver/application", () => {
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

    it("returns error when driver not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Driver not found")
    })

    it("returns applications for authenticated driver", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(mockDriver)
        ;(prisma.driver_Application.findMany as jest.Mock).mockResolvedValue(mockApplications)
        ;(prisma.driver_Sponsor_Org.findMany as jest.Mock).mockResolvedValue(mockJoinedOrgs)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.pendingApplications).toHaveLength(1)
        expect(data.pendingApplications[0].Application_ID).toBe(1)
        expect(data.pastApplications).toHaveLength(1)
        expect(data.pastApplications[0].Application_ID).toBe(2)
        expect(data.joinedOrganizations).toHaveLength(1)
        expect(data.joinedOrganizations[0].Org_Name).toBe("Approved Org")
    })
})

describe("POST /api/driver/application", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized")
    })

    it("rejects non-driver users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized")
    })

    it("returns error when orgId is missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(mockDriver)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({})
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Organization ID is required")
    })

    it("returns error when driver not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Driver not found")
    })

    it("returns error for duplicate pending application", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(mockDriver)
        ;(prisma.driver_Application.findFirst as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            Status: "P"
        })

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("You already have a pending application to this organization")
    })

    it("returns error when already joined organization", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(mockDriver)
        ;(prisma.driver_Application.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.driver_Sponsor_Org.findFirst as jest.Mock).mockResolvedValue({
            User_ID: 100,
            Org_ID: 10
        })

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 10 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("You are already part of this organization")
    })

    it("returns error when organization not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(mockDriver)
        ;(prisma.driver_Application.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.driver_Sponsor_Org.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 999 })
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Organization not found")
    })

    it("successfully submits application", async () => {
        const newApplication = {
            Application_ID: 3,
            User_ID: 100,
            Org_ID: 12,
            Status: "P",
            Application_Date: new Date()
        }

        mockAuth.mockResolvedValue({ user: { id: "100", role: "D" } })
        ;(prisma.driver.findUnique as jest.Mock).mockResolvedValue(mockDriver)
        ;(prisma.driver_Application.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.driver_Sponsor_Org.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue({
            Org_ID: 12,
            Org_Name: "New Org"
        })
        ;(prisma.driver_Application.create as jest.Mock).mockResolvedValue(newApplication)

        const response = await POST(new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify({ orgId: 12 })
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("Application submitted successfully")
        expect(data.application.Application_ID).toBe(3)
    })
})
