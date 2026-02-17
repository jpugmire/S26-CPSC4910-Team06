// app/login/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
    const session = await auth()

    if (session) {
      redirect("/dashboard")
    }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Driver Rewards System
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}