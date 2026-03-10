"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"

type UserData = {
  User_ID: number
  Username: string
  Email: string | null
  Phone: string | null
  Org_Name: string | null
}

export default function AccountPage() {
  const params = useParams()
  const userId = params.userId as string

  const [user, setUser] = useState<UserData | null>(null)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`/api/user/${userId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Failed to fetch user")
          setLoading(false)
          return
        }

        setUser(data)
        setEmail(data.Email || "")
        setPhone(data.Phone || "")
      } catch {
        setError("Something went wrong while fetching user info")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  async function handleSave() {
    try {
      setSaving(true)
      setError("")

      const res = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update user")
        return
      }

      setUser(data)
      alert("Updated successfully")
    } catch {
      setError("Something went wrong while updating user info")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <p>Loading...</p>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <p>{error}</p>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <p>User not found.</p>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div>
        <h1>Account Details</h1>

        <p>
          <strong>Username:</strong> {user.Username}
        </p>

        {user.Org_Name && (
          <p>
            <strong>Organization:</strong> {user.Org_Name}
          </p>
        )}

        <div>
          <label>Email:</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label>Phone:</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  )
}