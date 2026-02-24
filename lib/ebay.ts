const EBAY_API_BASE = "https://api.ebay.com/buy/browse/v1"
const EBAY_API_BASE_SANDBOX = "https://api.sandbox.ebay.com/buy/browse/v1"

export interface EbaySearchResult {
  itemId: string
  title: string
  image: {
    imageUrl: string
  }
  price: {
    value: string
    currency: string
  }
  condition: string
  buyingOptions: string[]
  itemHref: string
  seller: {
    username: string
    feedbackPercentage: string
  }
}

export interface EbayItemDetail {
  itemId: string
  title: string
  shortDescription: string
  description: string
  image: {
    imageUrl: string
  }
  price: {
    value: string
    currency: string
  }
  condition: string
  conditionId: string
  availability: {
    availabilityType: string
    estimatedAvailabilityStatus: string
    estimatedAvailableQuantity: number
  }
  shippingOptions: {
    shippingCostType: string
    shippingCost: {
      value: string
      currency: string
    }
    estimatedDelivery: {
      minDays: number
      maxDays: number
    }
  }[]
  returnPolicies: {
    returnsAccepted: boolean
    refundMethod: string
    returnPeriod: {
      unit: string
      value: number
    }
  }[]
  seller: {
    username: string
    feedbackPercentage: string
    feedbackScore: number
  }
}

export interface EbaySearchResponse {
  total: number
  nextOffset: number
  limit: number
  items: EbaySearchResult[]
}

function getEbayBaseUrl(): string {
  if (process.env.EBAY_USE_SANDBOX === "true") {
    return EBAY_API_BASE_SANDBOX
  }
  return EBAY_API_BASE
}

function getEbayToken(): string {
  const token = process.env.EBAY_APP_TOKEN
  if (!token) {
    throw new Error("EBAY_APP_TOKEN environment variable is not set. Get an OAuth access token from eBay Developer Portal.")
  }
  return token
}

export async function searchEbayItems(
  keyword: string,
  limit: number = 20,
  offset: number = 0
): Promise<EbaySearchResponse> {
  const baseUrl = getEbayBaseUrl()
  const token = getEbayToken()

  const params = new URLSearchParams({
    q: keyword,
    limit: limit.toString(),
    offset: offset.toString(),
  })

  const response = await fetch(
    `${baseUrl}/item_summary/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`eBay API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    total: data.total || 0,
    nextOffset: data.nextOffset || 0,
    limit: data.limit || limit,
    items: (data.itemSummaries || []).map((item: any) => ({
      itemId: item.itemId,
      title: item.title,
      image: {
        imageUrl: item.image?.imageUrl || "",
      },
      price: {
        value: item.price?.value || "0",
        currency: item.price?.currency || "USD",
      },
      condition: item.condition || "Unknown",
      buyingOptions: item.buyingOptions || [],
      itemHref: item.itemHref || "",
      seller: {
        username: item.seller?.username || "Unknown",
        feedbackPercentage: item.seller?.feedbackPercentage || "0",
      },
    })),
  }
}

export async function getEbayItemDetails(itemId: string): Promise<EbayItemDetail> {
  const baseUrl = getEbayBaseUrl()
  const token = getEbayToken()

  const response = await fetch(`${baseUrl}/item/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`eBay API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    itemId: data.itemId,
    title: data.title,
    shortDescription: data.shortDescription || "",
    description: data.description || "",
    image: {
      imageUrl: data.image?.imageUrl || "",
    },
    price: {
      value: data.price?.value || "0",
      currency: data.price?.currency || "USD",
    },
    condition: data.condition || "Unknown",
    conditionId: data.conditionId || "",
    availability: {
      availabilityType: data.availability?.availabilityType || "",
      estimatedAvailabilityStatus:
        data.availability?.estimatedAvailabilityStatus || "",
      estimatedAvailableQuantity:
        data.availability?.estimatedAvailableQuantity || 0,
    },
    shippingOptions: data.shippingOptions || [],
    returnPolicies: data.returnPolicies || [],
    seller: {
      username: data.seller?.username || "Unknown",
      feedbackPercentage: data.seller?.feedbackPercentage || "0",
      feedbackScore: data.seller?.feedbackScore || 0,
    },
  }
}

export function parseEbayItemId(ebayId: string): string {
  if (ebayId.startsWith("v1|")) {
    return ebayId
  }
  return `v1|${ebayId}|0`
}

const EBAY_PLACEHOLDER_DOMAINS = [
  "ir.ebaystatic.com",
  "via.placeholder.com",
  "images.unsplash.com",
]

export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || url.length === 0) return false
  
  try {
    const urlObj = new URL(url)
    const isPlaceholder = EBAY_PLACEHOLDER_DOMAINS.some(
      domain => urlObj.hostname.includes(domain)
    )
    
    if (isPlaceholder) return false
    
    const pathname = urlObj.pathname.toLowerCase()
    const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(pathname)
    
    return hasValidExtension || urlObj.pathname.includes("/s-l")
  } catch {
    return false
  }
}
