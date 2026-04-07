"use client"

export default function HistoryList({
  transactions,
  latestTransactionId,
}: {
  transactions: any[]
  latestTransactionId: number | null
}) {
  return (
    <div className="space-y-4">
      {transactions.map((t) => (
        <div
          key={t.Transaction_ID}
          className="border rounded-lg p-4 flex justify-between items-center"
        >
          {/* LEFT SIDE */}
          <div>
            <p className="font-semibold">{t.Item_Name}</p>
            <p className="text-gray-600 text-sm">
              {t.Price === 1 ? "1 point" : `${t.Price} points`}
            </p>
          </div>

          {/* RIGHT SIDE */}
          <button
            onClick={async () => {
              await fetch("/api/driver/cancel", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transactionId: t.Transaction_ID,
                }),
              })
              location.reload()
            }}
            disabled={t.Transaction_ID !== latestTransactionId}
            className={`px-3 py-1 rounded-md border text-sm transition ${
              t.Transaction_ID === latestTransactionId
                ? "text-red-600 border-red-600 hover:bg-red-50"
                : "text-gray-400 border-gray-300 cursor-not-allowed"
            }`}
            title={
              t.Transaction_ID !== latestTransactionId
                ? "Only your most recent purchase can be canceled"
                : ""
            }
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  )
}