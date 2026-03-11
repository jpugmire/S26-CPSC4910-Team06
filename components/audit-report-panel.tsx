"use client";

import { useState } from "react";
// Fill in your Message_Type_IDs and their labels here. See prisma/MessageTracking.txt for list
const AUDIT_TYPES: { value: number; label: string }[] = [
    { value: 1, label: "User Created" },
    { value: 2, label: "User Deactivated" },
    { value: 3, label: "User Info Updated" },
    { value: 4, label: "User Signed In" },
    { value: 5, label: "User Points Changed" },
    { value: 6, label: "Conversion Rate Updated" },
];

type AuditRow = {
  Audit_ID: number;
  User_ID: number;
  Date_Created: string;
  Message: string;
  Message_Type_ID: number;
  Note: string | null;
};

interface AuditReportPanelProps {
  orgId?: number | null; // null/undefined = admin (sees all)
}

export function AuditReportPanel({ orgId }: AuditReportPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [results, setResults] = useState<AuditRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleType(value: number) {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function handleRunReport() {
    if (selectedTypes.length === 0) {
      setError("Please select at least one audit type.");
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      selectedTypes.forEach((t) => params.append("type", String(t)));

      if (orgId != null) params.append("orgId", String(orgId));

      const res = await fetch(`/api/audit-report?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit report.");
      const data: AuditRow[] = await res.json();
      setResults(data);
    } catch (err) {
      setError("An error occurred while fetching the report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Type selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Select Audit Type(s)
        </p>
        <div className="flex flex-wrap gap-2">
          {AUDIT_TYPES.map((type) => {
            const selected = selectedTypes.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
        {selectedTypes.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {selectedTypes.length} type{selectedTypes.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Run button */}
      <div>
        <button
          onClick={handleRunReport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? "Running..." : "Run Report"}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Results table */}
      {results !== null && (
        <div>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">No records found for the selected types.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600 uppercase text-xs tracking-wide">
                    <th className="px-4 py-3 border-b">Audit ID</th>
                    <th className="px-4 py-3 border-b">User ID</th>
                    <th className="px-4 py-3 border-b">Message</th>
                    <th className="px-4 py-3 border-b">Note</th>
                    <th className="px-4 py-3 border-b">Type ID</th>
                    <th className="px-4 py-3 border-b">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={row.Audit_ID} className="hover:bg-gray-50 border-b last:border-0">
                      <td className="px-4 py-3 text-gray-500">{row.Audit_ID}</td>
                      <td className="px-4 py-3 text-gray-700">{row.User_ID}</td>
                      <td className="px-4 py-3 text-gray-700">{row.Message}</td>
                      <td className="px-4 py-3 text-gray-700">{row.Note ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {row.Message_Type_ID}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(row.Date_Created).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}