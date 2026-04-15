import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import HistoryList from "@/components/driver/history-list"
import Navbar from "@/components/navbar"
import ImpersonationBanner from "@/components/impersonation-banner"

export default async function HistoryPage() {
  const session = await auth()

  if (!session || session.user.role !== "D") {
    redirect("/dashboard")
  }

  const transactions = await prisma.point_Transaction.findMany({
    where: {
      User_ID: Number(session.user.id),
    },
    include: {
      Catalog_Item: true,
    },
    orderBy: {
      Transaction_Date: "desc",
    },
  })

  const latestTransactionId = transactions[0]?.Transaction_ID ?? null

  const safeTransactions = transactions.map((t) => ({
    Transaction_ID: t.Transaction_ID,
    Item_Name: t.Catalog_Item.Item_Name,
    Price: Number(t.Price),
  }))

  return (
    <div className="min-h-screen bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <Navbar />
      <ImpersonationBanner />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Purchase History
          </h1>

          {transactions.length === 0 ? (
            <p className="text-center text-gray-500">
              No purchases yet.
            </p>
          ) : (
            <HistoryList
              transactions={safeTransactions}
              latestTransactionId={latestTransactionId}
            />
          )}
        </div>
      </div>
    </div>
  )
}