"use client"

import { useEffect, useState } from "react"
import { isValidImageUrl } from "@/lib/ebay"

interface CatalogItem {
  Item_ID: number
  Item_Name: string
  Item_Description: string | null
  Item_Image_URL: string | null
  Ebay_Item_ID: string | null
  Point_Price: number | null
}

interface Catalog {
  Catalog_ID: number
  Org_ID: number
  Org_Name: string | null
  items: CatalogItem[]
}

interface EbaySearchItem {
  itemId: string
  title: string
  image: { imageUrl: string }
  price: { value: string; currency: string }
  condition: string
}

export function SponsorCatalogManager() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<EbaySearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedItem, setSelectedItem] = useState<EbaySearchItem | null>(null)
  const [pointPrice, setPointPrice] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const [editPrice, setEditPrice] = useState("")

  useEffect(() => {
    fetchCatalog()
  }, [])

  async function fetchCatalog() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/sponsor/catalog")
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to fetch catalog")
      } else {
        setCatalog(data.catalog)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setError("")
    try {
      const res = await fetch(`/api/ebay/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Search failed")
      } else {
        setSearchResults(data.items)
      }
    } catch {
      setError("Search failed")
    } finally {
      setSearching(false)
    }
  }

  async function handleAddItem(item: EbaySearchItem) {
    setSelectedItem(item)
    setPointPrice("")
  }

  async function confirmAddItem() {
    if (!selectedItem) return

    setAddingItem(true)
    setError("")
    try {
      const res = await fetch("/api/sponsor/catalog/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebayItemId: selectedItem.itemId,
          pointPrice: pointPrice ? parseInt(pointPrice) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to add item")
      } else {
        setSelectedItem(null)
        setShowSearch(false)
        setSearchQuery("")
        setSearchResults([])
        fetchCatalog()
      }
    } catch {
      setError("Failed to add item")
    } finally {
      setAddingItem(false)
    }
  }

  async function handleUpdatePrice(item: CatalogItem) {
    setEditingItem(item)
    setEditPrice(item.Point_Price?.toString() || "")
  }

  async function confirmUpdatePrice() {
    if (!editingItem) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/sponsor/catalog/items/${editingItem.Item_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointPrice: editPrice ? parseInt(editPrice) : null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to update item")
      } else {
        setEditingItem(null)
        fetchCatalog()
      }
    } catch {
      setError("Failed to update item")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteItem(item: CatalogItem) {
    if (!confirm(`Remove "${item.Item_Name}" from catalog?`)) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/sponsor/catalog/items/${item.Item_ID}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to remove item")
      } else {
        fetchCatalog()
      }
    } catch {
      setError("Failed to remove item")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !catalog) {
    return <p className="text-gray-500">Loading...</p>
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!showSearch ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              {catalog?.items.length || 0} items in catalog
            </p>
            <button
              onClick={() => setShowSearch(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Items from eBay
            </button>
          </div>

          {catalog?.items.length === 0 ? (
            <div className="text-center py-12 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded shadow">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your catalog is empty.</p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog?.items.map((item) => {
                const imageUrl = item.Item_Image_URL
                const hasValidImage = isValidImageUrl(imageUrl)
                return (
                <div key={item.Item_ID} className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 p-4 rounded shadow">
                  {hasValidImage ? (
                    <img
                      src={imageUrl!}
                      alt={item.Item_Name}
                      className="w-full h-48 object-contain mb-3"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-3">
                      <span className="text-gray-400 text-sm">No image available</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {item.Item_Name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {item.Point_Price !== null ? (
                        <span className="text-lg font-bold text-green-600">
                          {item.Point_Price} points
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No price set</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdatePrice(item)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setShowSearch(false)
                setSelectedItem(null)
                setSearchQuery("")
                setSearchResults([])
              }}
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              &larr; Back to Catalog
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search eBay for items..."
                className="flex-1 px-4 py-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((item) => (
                <div key={item.itemId} className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 p-4 rounded shadow">
                  {isValidImageUrl(item.image?.imageUrl) ? (
                    <img
                      src={item.image.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-contain mb-3"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-3">
                      <span className="text-gray-400 text-sm">No image available</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    ${item.price.value} {item.price.currency}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{item.condition}</p>
                  <button
                    onClick={() => handleAddItem(item)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add to Catalog
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Item to Catalog</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{selectedItem.title}</p>
            <p className="text-gray-600 mb-4">
              ${selectedItem.price.value} {selectedItem.price.currency}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Point Price (optional)
              </label>
              <input
                type="number"
                value={pointPrice}
                onChange={(e) => setPointPrice(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Set the point value drivers need to redeem this item
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700 dark:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddItem}
                disabled={addingItem}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {addingItem ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Point Price</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{editingItem.Item_Name}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Point Price</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700 dark:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdatePrice}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
