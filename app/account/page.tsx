"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

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
      </div>
    </>
  );
}
