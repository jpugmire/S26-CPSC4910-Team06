// app/page.tsx
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Driver Rewards System</h1>
        <p className="text-gray-600 mb-8">Manage your points and rewards</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}