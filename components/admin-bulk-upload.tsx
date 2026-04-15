"use client";

import { useState } from "react";

export default function BulkUploadDrivers() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/auth/bulkRegister", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setResult(data);
        setFile(null);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setError("");
          }}
          className="w-full text-sm text-gray-600 dark:text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            dark:file:bg-blue-900/30 dark:file:text-blue-300
            hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
            file:cursor-pointer cursor-pointer"
        />
        {file && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Selected: {file.name}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          Upload complete.
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
    </div>
  );
}
