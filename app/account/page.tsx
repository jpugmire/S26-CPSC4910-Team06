"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { auth } from "@/auth"
import ImpersonationBanner from "@/components/impersonation-banner"


export default async function AccountPage() {
  const session = await auth();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data);
      setEmail(data.Email || "");
      setPhone(data.Phone || "");
      setLoading(false);
    }

    fetchUser();
  }, []);

  async function handleSave() {
    await fetch("/api/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        phone,
      }),
    });

    alert("Updated successfully");
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this organization? You will need to apply again to rejoin.")) {
      return
    }

    setLeaving(true)
    try {
      const res = await fetch("/api/driver/leave", {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        alert("You have left the organization.")
        window.location.reload()
      } else {
        alert(data.error || "Failed to leave organization")
      }
    } catch {
      alert("Failed to leave organization")
    } finally {
      setLeaving(false)
    }
  }

  if (loading)
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      {session?.user?.impersonating && (<ImpersonationBanner />)}
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

        <button onClick={handleSave}>Save Changes</button>

        {user.Org_Name && (
          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #ccc" }}>
            <button 
              onClick={handleLeave} 
              disabled={leaving}
              style={{ backgroundColor: "#dc2626", color: "white", padding: "0.5rem 1rem", borderRadius: "0.25rem", border: "none", cursor: "pointer" }}
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h1>

          <div className="bg-white rounded-lg shadow p-6 space-y-6">

            {/* Read-only info */}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Username</span>
                <p className="mt-1 text-gray-900 font-medium">{user.Username}</p>
              </div>

              {user.Org_Name && (
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save Changes
            </button>

            {/* Leave org */}
            {user.Org_Name && (
              <>
                <hr className="border-gray-200" />
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Leave Organization</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    You will need to apply again to rejoin.
                  </p>
                  <button
                    onClick={handleLeave}
                    disabled={leaving}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {leaving ? "Leaving..." : "Leave Organization"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
