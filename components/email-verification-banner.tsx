"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

export default function EmailVerificationBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || session?.user?.isEmailVerified !== false) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <span className="font-semibold">Please verify your email address.</span>{" "}
          Check your inbox for a verification link. Unverified accounts may have limited access.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100 text-sm font-medium"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
