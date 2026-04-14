"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function PointForm() {
  const router = useRouter()
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("")
  const [driverId, setDriverId] = useState<number | null>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [pointValue, setPointValue] = useState<number>(0);
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDrivers = async () => {
      const res = await fetch("/api/sponsor/users")
      const data = await res.json()
      if (res.ok) {
        setDrivers(data.drivers ?? [])
      }
    }
    fetchDrivers()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/sponsor/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, pointValue, reason: reason || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to set driver points")
      } else {
        setSuccess("Driver points updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
        setPointValue(0);
        setReason("");
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Driver</label>
          <select
            value={driverId ?? ""}
            onChange={(e) => setDriverId(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select Driver</option>
            {drivers.filter(user => user.Driver).map((driver) => (
              <option key={driver.User_ID} value={driver.User_ID}>
                {driver.Username}
              </option>
            ))}
          </select>
        </div>

      <div>
        <label className="block text-sm font-medium mb-1">Points</label>
        <input
          type="number"
          value={pointValue}
          onChange={(e) => setPointValue(Number(e.target.value))}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full border px-3 py-2 rounded-md"
          rows={3}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
      >
        {loading ? "Creating..." : "Update Driver Points"}
      </button>
      {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>)}
    </form>
  )
}
