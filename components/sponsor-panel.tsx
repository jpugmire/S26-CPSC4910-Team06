"use client"

import { useEffect, useState } from "react"
import Link from "next/link";

export default function SponsorPanel() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [pointDollarValue, setPointDollarValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/sponsor/users")
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Failed to fetch drivers")
        } else {
          setDrivers(data.drivers ?? [])
        }
      } catch {
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    const fetchConversion = async () => {
      try {
        const res = await fetch("/api/sponsor/conversion")
        const data = await res.json()
        if (res.ok) {
          const raw = data?.conversion?.Point_Dollar_Value
          setPointDollarValue(raw ? Number(raw) : null)
        }
      } catch {
        // ignore
      }
    }

    fetchDrivers()
    fetchConversion()
  }, [])

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Point Dollar Value:{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {pointDollarValue !== null ? `$${pointDollarValue}` : "N/A"}
        </span>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
          <thead className="bg-gray-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {drivers.map((driver) => (
              <tr key={driver.User_ID} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                  <Link href={`/account/${driver.User_ID}`}>{driver.User_ID}</Link>
                </td>
                <td className="px-4 py-3 text-sm">{driver.Username}</td>
                <td className="px-4 py-3 text-sm">{driver.Status}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">
                  {driver.Driver?.Driver_Sponsor_Org?.[0]?.Point_Count ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
