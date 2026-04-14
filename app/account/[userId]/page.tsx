"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"
import ImpersonationBanner from "@/components/impersonation-banner"

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
  twoFactorEnabled: boolean
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

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
        setTwoFactorEnabled(data.twoFactorEnabled ?? false)
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

  async function handleToggle2FA() {
    const newValue = !twoFactorEnabled
    const res = await fetch(`/api/user/${userId}/2fa`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newValue })
    })
    if (res.ok) {
      setTwoFactorEnabled(newValue)
    } else {
      setError("Failed to update 2FA setting")
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    )
  }

  if (error && !user) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">User not found.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <ImpersonationBanner />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg shadow p-6 space-y-6">

            {/* Read-only info */}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Username</span>
                <p className="mt-1 text-gray-900 font-medium">{user.Username}</p>
              </div>

              {user.User_Type !== "D" && user.Org_Name && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Organization</span>
                  <p className="mt-1 text-gray-900 font-medium">{user.Org_Name}</p>
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Editable fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <hr className="border-gray-200" />

            {/* 2FA */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mb-3">
                When enabled, you will be emailed a verification code each time you log in.
              </p>
              <button
                onClick={handleToggle2FA}
                className={`text-sm font-medium py-2 px-4 rounded-md transition-colors text-white ${
                  twoFactorEnabled
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>

            {/* Driver orgs */}
            {user.User_Type === "D" && user.joinedOrganizations && user.joinedOrganizations.length > 0 && (
              <>
                <hr className="border-gray-200" />
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Your Organizations</h3>
                  <ul className="space-y-2">
                    {user.joinedOrganizations.map((org) => (
                      <li
                        key={org.Org_ID}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm font-medium text-gray-900">{org.Org_Name}</span>
                        <button
                          onClick={() => handleLeave(org.Org_ID, org.Org_Name)}
                          disabled={leaving}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium py-1 px-3 rounded-md transition-colors"
                        >
                          {leaving ? "Leaving..." : "Leave"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
