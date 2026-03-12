"use client";

import { useState, useRef, useEffect } from "react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState<AuditRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

  function toggleType(value: number) {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

    function toggleAll() {
    setSelectedTypes((prev) =>
      prev.length === AUDIT_TYPES.length ? [] : AUDIT_TYPES.map((t) => t.value)
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

  // Build a summary label for the dropdown trigger
  const dropdownLabel =
    selectedTypes.length === 0
      ? "Select types..."
      : selectedTypes.length === AUDIT_TYPES.length
      ? "All types selected"
      : selectedTypes.length === 1
      ? AUDIT_TYPES.find((t) => t.value === selectedTypes[0])?.label ?? "1 selected"
      : `${selectedTypes.length} types selected`;

  return (
    <div className="flex flex-col gap-6">
      {/* Dropdown type selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Select Audit Type(s)
        </p>
        <div className="relative" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-blue-400 transition-colors"
          >
            <span>{dropdownLabel}</span>
            {/* Chevron icon */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* Select all */}
              <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={selectedTypes.length === AUDIT_TYPES.length}
                  onChange={toggleAll}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>

              {/* Individual type options */}
              {AUDIT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.value)}
                    onChange={() => toggleType(type.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
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