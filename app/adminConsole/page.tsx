import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()

  // not logged in
  if (!session) redirect("/login")

  // not admin
  if (session.user?.role !== "A") redirect("/dashboard")

  return (
    <main>
      <h1>Admin</h1>
      <p>Welcome {session.user.username}</p>
    </main>
  )
}
