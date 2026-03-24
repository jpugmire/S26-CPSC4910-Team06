"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"

type JoinedOrganization = {
  Org_ID: number
  Org_Name: string
}

type UserData = {
  User_ID: number
  Username: string
  Email: string | null
  Phone: string | null
  Org_Name: string | null
  Org_ID: number | null
  User_Type: string
  joinedOrganizations?: JoinedOrganization[]
}

export default function AccountPage() {
  const params = useParams()
  const userId = params.userId as string

  const [user, setUser] = useState<UserData | null>(null)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)
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

  async function handleLeave(orgId: number, orgName: string) {
    if (!confirm(`Are you sure you want to leave ${orgName}? You will need to apply again to rejoin.`)) {
      return
    }

    setLeaving(true)
    try {
      const res = await fetch("/api/driver/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgId }),
      })
      const data = await res.json()

      if (res.ok) {
        alert(`You have left ${orgName}.`)
        window.location.reload()
      } else {
        setError(data.error || "Failed to leave organization")
      }
    } catch {
      setError("Failed to leave organization")
    } finally {
      setLeaving(false)
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

        {user.User_Type !== "D" && user.Org_Name && (
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

        {user.User_Type === "D" && user.joinedOrganizations && user.joinedOrganizations.length > 0 && (
          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #ccc" }}>
            <h3>Your Organizations</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {user.joinedOrganizations.map((org) => (
                <li key={org.Org_ID} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span><strong>{org.Org_Name}</strong></span>
                  <button
                    onClick={() => handleLeave(org.Org_ID, org.Org_Name)}
                    disabled={leaving}
                    style={{ backgroundColor: "#dc2626", color: "white", padding: "0.25rem 0.75rem", borderRadius: "0.25rem", border: "none", cursor: "pointer" }}
                  >
                    {leaving ? "Leaving..." : "Leave"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}