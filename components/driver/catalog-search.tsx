"use client"

import { useState } from "react"

interface CatalogItem {
  Item_ID: number
  Item_Name: string
  Item_Image_URL: string | null
  Point_Price: number | null
}

export default function CatalogSearch({ items }: { items: CatalogItem[] }) {
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredItems = items.filter((item) =>
    item.Item_Name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Search catalog..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-2 mb-6"
      />

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <p>No items match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.Item_ID}
              className="bg-white border rounded-lg shadow p-4"
            >
              {item.Item_Image_URL && (
                <img
                  src={item.Item_Image_URL}
                  alt={item.Item_Name}
                  className="w-full h-40 object-contain mb-3"
                />
              )}

              <p className="font-semibold text-lg">{item.Item_Name}</p>

              <p className="text-gray-600">
                {item.Point_Price === 1
                  ? "1 point"
                  : `${item.Point_Price ?? "No"} points`}
              </p>
              <button
                onClick={async () => {
                  setMessage(null)
                  setError(null)

                  try {
                    const res = await fetch("/api/driver/purchase", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ itemId: item.Item_ID }),
                    })

                    const data = await res.json()

                    if (!res.ok) {
                      setError(data.error || "Purchase failed")
                    } else {
                      setMessage("Purchase successful!")
                    }
                  } catch {
                    setError("Something went wrong")
                  }
                }}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}