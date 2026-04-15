"use client"

import { useState, useEffect } from "react"

type Transaction = {
  Transaction_ID: number
  Org_ID: number | null
  Org_Name: string
  Item_Name: string
  Point_Cost: number
  Transaction_Date: string
}

type RecentTransactionsProps = {
  selectedOrgId: number | null
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`
  return `${Math.floor(diffDays / 365)} year${diffDays >= 730 ? "s" : ""} ago`
}

export function RecentTransactions({ selectedOrgId }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    setTransactions([])
    setOffset(0)
    setInitialLoading(true)
    fetchTransactions(0, true)
  }, [selectedOrgId])

  const fetchTransactions = async (currentOffset: number, isInitial = false) => {
    if (loading) return
    setLoading(true)

    try {
      const url = new URL("/api/driver/transactions", window.location.origin)
      url.searchParams.set("limit", "5")
      url.searchParams.set("offset", currentOffset.toString())
      if (selectedOrgId !== null) {
        url.searchParams.set("orgId", selectedOrgId.toString())
      }

      const res = await fetch(url.toString())
      const data = await res.json()

      if (isInitial) {
        setTransactions(data.transactions || [])
      } else {
        setTransactions((prev) => [...prev, ...(data.transactions || [])])
      }
      setHasMore(data.hasMore || false)
      setOffset(currentOffset + 5)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  const handleLoadMore = () => {
    fetchTransactions(offset, false)
  }

  if (initialLoading) {
    return (
      <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.Transaction_ID}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-700 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-zinc-100">{tx.Item_Name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tx.Org_Name} • {formatRelativeTime(tx.Transaction_Date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  -{tx.Point_Cost.toLocaleString()} pts
                </p>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-200 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
