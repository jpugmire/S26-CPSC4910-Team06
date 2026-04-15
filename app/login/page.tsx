// app/login/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>
}) {
    const session = await auth()

    if (session) {
      redirect("/dashboard")
    }

  const { verified } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md">
        {verified === "true" && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
            Email verified! You can now sign in.
          </div>
        )}
        <div className="bg-white shadow-md rounded-lg p-8 dark:bg-zinc-700">
          <h1 className="text-2xl font-bold text-center mb-6">
            Driver Rewards System
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}