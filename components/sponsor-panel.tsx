"use client"

import { useEffect, useState } from "react"

export default function SponsorPanel() {
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await fetch("/api/sponsor/users")
        const data = await res.json()

        if (!res.ok) setError(data.error || "Failed to fetch drivers")
        else setDrivers(data.drivers ?? [])
      } catch {
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers();
  }, [])

  return (
    <div className="mt-6 overflow-x-auto">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Username</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Points</th>
          </tr>
        </thead>
        <table>
            <tbody>
            {drivers.map((driver) => (
                <tr key={driver.User_ID} className="text-center">
                <td className="px-4 py-2 border">{driver.User_ID}</td>
                <td className="px-4 py-2 border">{driver.Username}</td>
                <td className="px-4 py-2 border">{driver.Status}</td>
                <td className="px-4 py-2 border">{driver.Driver?.Point_Count}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}
