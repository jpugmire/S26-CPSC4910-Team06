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
        console.log("Fetching drivers...");
        const res = await fetch("/api/sponsor/users")
        console.log("Drivers response status:", res.status);
        const data = await res.json()
        console.log("Drivers response data:", data);

        if (!res.ok) {
          setError(data.error || "Failed to fetch drivers")
        } else {
          console.log("Setting drivers:", data.drivers);
          setDrivers(data.drivers ?? [])
        }
      } catch (error) {
        console.error("Drivers fetch error:", error);
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    const fetchConversion = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await fetch("/api/sponsor/conversion")
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Failed to fetch conversion")
        } else {
          // data might be { Point_Dollar_Value: "1" }
          const raw = data?.conversion?.Point_Dollar_Value
          setPointDollarValue(raw ? Number(raw) : null)
        }
      } catch {
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers();
    fetchConversion();
  }, [])

  return (
    <div className="mt-6 overflow-x-auto">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
        <h2>
          Point Dollar Value:{" "}
          {pointDollarValue !== null ? pointDollarValue : "N/A"}
        </h2>
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
                <td className="px-4 py-2 border text-blue-600 hover:underline">
                  <Link href={`/account/${driver.User_ID}`}>
                      {driver.User_ID}
                  </Link>
                </td>
                <td className="px-4 py-2 border">{driver.Username}</td>
                <td className="px-4 py-2 border">{driver.Status}</td>
                <td className="px-4 py-2 border">{driver.Driver?.Driver_Sponsor_Org?.[0]?.Point_Count ?? 0}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}
