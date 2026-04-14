"use client";

import { useState } from "react";

export default function BulkUploadDrivers() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleUpload() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/auth/bulkRegister", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className = "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload}>Upload CSV</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}