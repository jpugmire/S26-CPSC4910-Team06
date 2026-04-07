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
        <p>Loading...</p>
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
            >
              {leaving ? "Leaving..." : "Leave Organization"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
