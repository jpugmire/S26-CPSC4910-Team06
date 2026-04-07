import { GET } from "@/app/api/audit-report/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

jest.mock("@/lib/prisma", () => ({
    prisma: {
        sponsor: {
            findMany: jest.fn()
        },
        driver_Sponsor_Org: {
            findMany: jest.fn()
        },
        audit: {
            findMany: jest.fn()
        }
    }
}))

const baseUrl = "http://localhost/api/audit-report"

const mockAuditRows = [
    {
        Audit_ID: 1,
        User_ID: 100,
        Date_Created: new Date("2024-01-01"),
        Message_Type_ID: 1,
        Message: "User logged in",
        Note: null
    },
    {
        Audit_ID: 2,
        User_ID: 101,
        Date_Created: new Date("2024-01-02"),
        Message_Type_ID: 2,
        Message: "User registered",
        Note: "New driver"
    }
]

describe("GET /api/audit-report", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await GET(new NextRequest(baseUrl + "?type=1"))
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe("Unauthorized")
    })

    it("rejects driver users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await GET(new NextRequest(baseUrl + "?type=1"))
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe("Forbidden")
    })

    it("returns error when no types provided", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("No types provided")
    })

    it("allows admin to fetch audit report", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.audit.findMany as jest.Mock).mockResolvedValue(mockAuditRows)

        const response = await GET(new NextRequest(baseUrl + "?type=1&type=2"))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(2)
    })

    it("allows sponsor to fetch audit report", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findMany as jest.Mock).mockResolvedValue([{ User_ID: 1 }])
        ;(prisma.driver_Sponsor_Org.findMany as jest.Mock).mockResolvedValue([])
        ;(prisma.audit.findMany as jest.Mock).mockResolvedValue([])

        const response = await GET(new NextRequest(baseUrl + "?type=1"))
        const data = await response.json()

        expect(response.status).toBe(200)
    })

    it("filters by orgId for sponsor", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findMany as jest.Mock).mockResolvedValue([{ User_ID: 1 }])
        ;(prisma.driver_Sponsor_Org.findMany as jest.Mock).mockResolvedValue([{ User_ID: 100 }])
        ;(prisma.audit.findMany as jest.Mock).mockResolvedValue([mockAuditRows[0]])

        const response = await GET(new NextRequest(baseUrl + "?type=1&orgId=10"))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(1)
    })

    it("filters by date range", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.audit.findMany as jest.Mock).mockResolvedValue([mockAuditRows[0]])

        const response = await GET(new NextRequest(baseUrl + "?type=1&minDate=2024-01-01&maxDate=2024-01-01"))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(prisma.audit.findMany).toHaveBeenCalled()
    })

    it("filters by userIds", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.audit.findMany as jest.Mock).mockResolvedValue([mockAuditRows[0]])

        const response = await GET(new NextRequest(baseUrl + "?type=1&userId=100"))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(prisma.audit.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    User_ID: { in: [100] }
                })
            })
        )
    })

    it("sorts by specified column", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.audit.findMany as jest.Mock).mockResolvedValue([])

        const response = await GET(new NextRequest(baseUrl + "?type=1&sortColumn=Audit_ID&sortOrder=desc"))

        expect(response.status).toBe(200)
        expect(prisma.audit.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: { Audit_ID: "desc" }
            })
        )
    })

    it("throws on database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.sponsor.findMany as jest.Mock).mockRejectedValue(new Error("DB error"))

        await expect(GET(new NextRequest(baseUrl + "?type=1&orgId=10"))).rejects.toThrow("DB error")
    })
})
