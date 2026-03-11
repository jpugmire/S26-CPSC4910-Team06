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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}