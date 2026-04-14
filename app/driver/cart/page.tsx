"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(stored)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">My Cart</h1>

          {cart.length === 0 ? (
            <p className="text-center text-gray-500">
              Your cart is empty
            </p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.Item_Name}</p>
                      <p className="text-gray-600 text-sm">
                        {item.Point_Price === 1
                          ? "1 point"
                          : `${item.Point_Price ?? "No"} points`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={async () => {
                  const res = await fetch("/api/driver/purchase-cart", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ items: cart }),
                  })

                  if (res.ok) {
                    localStorage.removeItem("cart")
                    setCart([])
                    alert("Purchase successful!")
                  } else {
                    alert("Purchase failed")
                  }

                  location.reload()
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}