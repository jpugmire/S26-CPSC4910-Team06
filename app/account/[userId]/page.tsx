import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AccountPage from "./account-page-client"

export default async function Page() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <AccountPage />
}
