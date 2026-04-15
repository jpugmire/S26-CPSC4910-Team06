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
      {/* Search */}
      <input
        type="text"
        placeholder="Search catalog..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400 rounded-lg p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Messages */}
      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <p>No items match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.Item_ID}
              className="bg-gray-50 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 border border-gray-200 dark:border-zinc-600 rounded-lg shadow-sm p-4 flex flex-col justify-between"
            >
              {/* Image */}
              {item.Item_Image_URL && (
                <img
                  src={item.Item_Image_URL}
                  alt={item.Item_Name}
                  className="w-full h-40 object-contain mb-3"
                />
              )}

              {/* Info */}
              <div>
                <p className="font-semibold text-lg mb-1">
                  {item.Item_Name}
                </p>

                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {item.Point_Price === 1
                    ? "1 point"
                    : `${item.Point_Price ?? "No"} points`}
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  const existing = JSON.parse(
                    localStorage.getItem("cart") || "[]"
                  )

                  const updated = [...existing, item]

                  localStorage.setItem("cart", JSON.stringify(updated))

                  setMessage("Added to cart!")
                }}
                className="w-full bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}