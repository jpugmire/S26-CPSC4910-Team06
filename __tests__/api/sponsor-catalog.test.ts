import { GET } from "@/app/api/sponsor/catalog/route"
import { POST } from "@/app/api/sponsor/catalog/items/route"
import { PATCH, DELETE } from "@/app/api/sponsor/catalog/items/[itemId]/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

jest.mock("@/lib/prisma", () => ({
    prisma: {
        sponsor: {
            findFirst: jest.fn()
        },
        catalog: {
            findFirst: jest.fn(),
            create: jest.fn()
        },
        catalog_Listing: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn()
        },
        catalog_Item: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    }
}))

const mockGetEbayItemDetails = jest.fn()
jest.mock("@/lib/ebay", () => ({
    getEbayItemDetails: (...args: unknown[]) => mockGetEbayItemDetails(...args)
}))

const baseUrl = "http://localhost/api/sponsor/catalog"

const mockSponsor = {
    User_ID: 1,
    Org_ID: 10,
    Sponsor_Org: {
        Org_Name: "Test Org"
    }
}

const mockCatalog = {
    Catalog_ID: 100,
    Org_ID: 10
}

const mockItem = {
    Item_ID: 1,
    Item_Name: "Test Item",
    Item_Description: "Test description",
    Item_Image_URL: "http://example.com/image.jpg",
    Ebay_Item_ID: "EB123",
    Point_Price: 500
}

describe("GET /api/sponsor/catalog", () => {
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

    it("rejects non-sponsor users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("returns catalog with items for authenticated sponsor", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Listing.findMany as jest.Mock).mockResolvedValue([
            { Catalog_Item: mockItem }
        ])

        const response = await GET(new NextRequest(baseUrl))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.catalog.items).toHaveLength(1)
        expect(data.catalog.items[0].Item_Name).toBe("Test Item")
    })

    it("creates catalog if none exists", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.catalog.create as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Listing.findMany as jest.Mock).mockResolvedValue([])

        const response = await GET(new NextRequest(baseUrl))

        expect(response.status).toBe(200)
        expect(prisma.catalog.create).toHaveBeenCalled()
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await GET(new NextRequest(baseUrl))

        expect(response.status).toBe(500)
    })
})

describe("POST /api/sponsor/catalog/items", () => {
    const itemsUrl = "http://localhost/api/sponsor/catalog/items"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await POST(new NextRequest(itemsUrl, {
            method: "POST",
            body: JSON.stringify({ ebayItemId: "EB123", pointPrice: 500 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("rejects non-sponsor users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await POST(new NextRequest(itemsUrl, {
            method: "POST",
            body: JSON.stringify({ ebayItemId: "EB123", pointPrice: 500 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("rejects missing ebayItemId", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await POST(new NextRequest(itemsUrl, {
            method: "POST",
            body: JSON.stringify({ pointPrice: 500 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("eBay item ID is required.")
    })

    it("adds item to catalog successfully", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Item.findFirst as jest.Mock).mockResolvedValue(null)
        mockGetEbayItemDetails.mockResolvedValue({
            title: "Test Item",
            description: "Test description",
            image: { imageUrl: "http://example.com/image.jpg" }
        })
        ;(prisma.catalog_Item.create as jest.Mock).mockResolvedValue(mockItem)
        ;(prisma.catalog_Listing.create as jest.Mock).mockResolvedValue({})

        const response = await POST(new NextRequest(itemsUrl, {
            method: "POST",
            body: JSON.stringify({ ebayItemId: "EB123", pointPrice: 500 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("Item added to catalog successfully.")
    })

    it("handles duplicate item in catalog", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Item.findFirst as jest.Mock).mockResolvedValue(mockItem)
        ;(prisma.catalog_Listing.findFirst as jest.Mock).mockResolvedValue({})

        const response = await POST(new NextRequest(itemsUrl, {
            method: "POST",
            body: JSON.stringify({ ebayItemId: "EB123", pointPrice: 500 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Item already in catalog.")
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await POST(new NextRequest(itemsUrl, {
            method: "POST",
            body: JSON.stringify({ ebayItemId: "EB123", pointPrice: 500 }),
            headers: { "Content-Type": "application/json" }
        }))

        expect(response.status).toBe(500)
    })
})

describe("PATCH /api/sponsor/catalog/items/[itemId]", () => {
    const itemUrl = "http://localhost/api/sponsor/catalog/items/1"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await PATCH(new NextRequest(itemUrl, {
            method: "PATCH",
            body: JSON.stringify({ pointPrice: 750 }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("rejects non-sponsor users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await PATCH(new NextRequest(itemUrl, {
            method: "PATCH",
            body: JSON.stringify({ pointPrice: 750 }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("rejects invalid item ID", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await PATCH(new NextRequest(itemUrl, {
            method: "PATCH",
            body: JSON.stringify({ pointPrice: 750 }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ itemId: "invalid" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Invalid item ID.")
    })

    it("updates item point price successfully", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Listing.findFirst as jest.Mock).mockResolvedValue({})
        ;(prisma.catalog_Item.update as jest.Mock).mockResolvedValue({
            ...mockItem,
            Point_Price: 750
        })

        const response = await PATCH(new NextRequest(itemUrl, {
            method: "PATCH",
            body: JSON.stringify({ pointPrice: 750 }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe("Item updated successfully.")
        expect(data.item.Point_Price).toBe(750)
    })

    it("returns error if item not in catalog", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Listing.findFirst as jest.Mock).mockResolvedValue(null)

        const response = await PATCH(new NextRequest(itemUrl, {
            method: "PATCH",
            body: JSON.stringify({ pointPrice: 750 }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Item not in catalog.")
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await PATCH(new NextRequest(itemUrl, {
            method: "PATCH",
            body: JSON.stringify({ pointPrice: 750 }),
            headers: { "Content-Type": "application/json" }
        }), { params: Promise.resolve({ itemId: "1" }) })

        expect(response.status).toBe(500)
    })
})

describe("DELETE /api/sponsor/catalog/items/[itemId]", () => {
    const itemUrl = "http://localhost/api/sponsor/catalog/items/1"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await DELETE(new NextRequest(itemUrl, {
            method: "DELETE"
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("rejects non-sponsor users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await DELETE(new NextRequest(itemUrl, {
            method: "DELETE"
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("rejects invalid item ID", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await DELETE(new NextRequest(itemUrl, {
            method: "DELETE"
        }), { params: Promise.resolve({ itemId: "abc" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Invalid item ID.")
    })

    it("removes item from catalog successfully", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Listing.findFirst as jest.Mock).mockResolvedValue({})
        ;(prisma.catalog_Listing.delete as jest.Mock).mockResolvedValue({})

        const response = await DELETE(new NextRequest(itemUrl, {
            method: "DELETE"
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe("Item removed from catalog successfully.")
    })

    it("returns error if item not in catalog", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.catalog.findFirst as jest.Mock).mockResolvedValue(mockCatalog)
        ;(prisma.catalog_Listing.findFirst as jest.Mock).mockResolvedValue(null)

        const response = await DELETE(new NextRequest(itemUrl, {
            method: "DELETE"
        }), { params: Promise.resolve({ itemId: "1" }) })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Item not in catalog.")
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await DELETE(new NextRequest(itemUrl, {
            method: "DELETE"
        }), { params: Promise.resolve({ itemId: "1" }) })

        expect(response.status).toBe(500)
    })
})
