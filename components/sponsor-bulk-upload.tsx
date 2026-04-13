"use client";

import { useState } from "react";

export default function SponsorBulkUploadUsers() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/sponsor/bulkRegister", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Results:</h3>
          <p>Total: {result.summary?.total || 0}</p>
          <p className="text-green-600">Created: {result.summary?.created || 0}</p>
          <p className="text-red-600">Failed: {result.summary?.failed || 0}</p>
          {result.results && result.results.length > 0 && (
            <pre className="mt-2 p-2 bg-gray-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(result.results, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
