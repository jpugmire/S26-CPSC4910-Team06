import { GET } from "@/app/api/sponsor/applications/route"
import { PATCH } from "@/app/api/sponsor/applications/[id]/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

jest.mock("@/lib/prisma", () => ({
    prisma: {
        sponsor: {
            findUnique: jest.fn()
        },
        driver_Application: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn()
        },
        driver: {
            update: jest.fn()
        }
    }
}))

const baseUrl = "http://localhost/api/sponsor/applications"

const mockSponsor = {
    User_ID: 1,
    Org_ID: 10
}

const mockApplications = [
    {
        Application_ID: 1,
        User_ID: 100,
        Org_ID: 10,
        Status: "P",
        Application_Date: new Date("2024-01-01"),
        Review_Date: null,
        User: {
            User_ID: 100,
            Username: "driver1",
            Email: "driver1@example.com",
            Phone: "555-1234",
            Date_Added: new Date("2024-01-01")
        }
    },
    {
        Application_ID: 2,
        User_ID: 101,
        Org_ID: 10,
        Status: "A",
        Application_Date: new Date("2024-01-02"),
        Review_Date: new Date("2024-01-03"),
        User: {
            User_ID: 101,
            Username: "driver2",
            Email: "driver2@example.com",
            Phone: null,
            Date_Added: new Date("2024-01-02")
        }
    }
]

describe("GET /api/sponsor/applications", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in")
    })

    it("rejects non-sponsor users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

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

    it("returns error if sponsor org not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Sponsor organization not found")
    })

    it("returns applications for authenticated sponsor", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.driver_Application.findMany as jest.Mock).mockResolvedValue(mockApplications)

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.applications).toHaveLength(2)
        expect(data.applications[0].User.Username).toBe("driver1")
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await GET(new NextRequest(baseUrl))

        expect(response.status).toBe(500)
    })
})

describe("PATCH /api/sponsor/applications/[id]", () => {
    const appUrl = "http://localhost/api/sponsor/applications/1"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in")
    })

    it("rejects non-sponsor users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized")
    })

    it("rejects invalid status", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "X" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Status must be 'A' (Approved) or 'R' (Rejected)")
    })

    it("returns error if sponsor org not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Sponsor organization not found")
    })

    it("returns error if application not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.driver_Application.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Application not found")
    })

    it("rejects application from different org", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.driver_Application.findUnique as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            User_ID: 100,
            Org_ID: 999,
            Status: "P"
        })

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized to review this application")
    })

    it("rejects already reviewed application", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.driver_Application.findUnique as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            User_ID: 100,
            Org_ID: 10,
            Status: "A"
        })

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Application already reviewed")
    })

    it("approves application and updates driver org", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.driver_Application.findUnique as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            User_ID: 100,
            Org_ID: 10,
            Status: "P"
        })
        ;(prisma.driver_Application.update as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            Status: "A",
            Review_Date: new Date()
        })
        ;(prisma.driver.update as jest.Mock).mockResolvedValue({})

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe("Application approved")
        expect(prisma.driver.update).toHaveBeenCalledWith({
            where: { User_ID: 100 },
            data: { Org_ID: 10 }
        })
    })

    it("rejects application without updating driver", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.driver_Application.findUnique as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            User_ID: 100,
            Org_ID: 10,
            Status: "P"
        })
        ;(prisma.driver_Application.update as jest.Mock).mockResolvedValue({
            Application_ID: 1,
            Status: "R",
            Review_Date: new Date()
        })

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "R" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe("Application rejected")
        expect(prisma.driver.update).not.toHaveBeenCalled()
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await PATCH(new NextRequest(appUrl, {
            method: "PATCH",
            body: JSON.stringify({ status: "A" }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ id: "1" }) })

        expect(response.status).toBe(500)
    })
})
