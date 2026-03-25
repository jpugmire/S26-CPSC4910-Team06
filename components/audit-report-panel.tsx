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
  isAdmin?: boolean; // true if user is admin
}

export function AuditReportPanel({ orgId, isAdmin }: AuditReportPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userIdInput, setUserIdInput] = useState<string>("");
  const [selectedOrgIds, setSelectedOrgIds] = useState<number[]>([]);
  const [sponsorOrgs, setSponsorOrgs] = useState<any[]>([]);
  const [results, setResults] = useState<AuditRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<"Audit_ID" | "User_ID" | "Message_Type_ID" | "Date_Created" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInput, setPageInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

	// Fetch sponsor organizations
	useEffect(() => {
		const fetchSponsorOrgs = async () => {
			try {
				const res = await fetch("/api/admin/sponsors");
				const data = await res.json();
				setSponsorOrgs(data.sponsorOrgs || []);
			} catch (err) {
				console.error("Failed to fetch sponsor organizations:", err);
			}
		};
		fetchSponsorOrgs();
	}, []);

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

	// Re-fetch when sort parameters change (if results are already loaded)
	useEffect(() => {
		if (results !== null && selectedTypes.length > 0) {
			setLoading(true);

			const params = new URLSearchParams();
			selectedTypes.forEach((t) => params.append("type", String(t)));

			if (orgId != null) params.append("orgId", String(orgId));
			selectedOrgIds.forEach((o) => params.append("filterOrgId", String(o)));
			if (minDate) params.append("minDate", minDate);
			if (maxDate) params.append("maxDate", maxDate);
			selectedUserIds.forEach((u) => params.append("userId", String(u)));
			if (sortColumn) params.append("sortColumn", sortColumn);
			if (sortColumn) params.append("sortOrder", sortOrder);

			fetch(`/api/audit-report?${params.toString()}`)
				.then((res) => {
					if (!res.ok) throw new Error("Failed to fetch audit report.");
					return res.json();
				})
				.then((data: AuditRow[]) => {
					setResults(data);
					setLoading(false);
				})
				.catch((err) => {
					setError("An error occurred while fetching the report.");
					setLoading(false);
				});
		}
	}, [sortColumn, sortOrder]);

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

  function addUserId() {
    const userId = Number(userIdInput);
    if (userIdInput && !isNaN(userId) && !selectedUserIds.includes(userId)) {
      setSelectedUserIds((prev) => [...prev, userId]);
      setUserIdInput("");
    }
  }

  function removeUserId(userId: number) {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  }

  function removeOrgId(orgIdNum: number) {
    setSelectedOrgIds((prev) => prev.filter((id) => id !== orgIdNum));
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
      selectedOrgIds.forEach((o) => params.append("filterOrgId", String(o)));
      if (minDate) params.append("minDate", minDate);
      if (maxDate) params.append("maxDate", maxDate);
      selectedUserIds.forEach((u) => params.append("userId", String(u)));
      if (sortColumn) params.append("sortColumn", sortColumn);
      if (sortColumn) params.append("sortOrder", sortOrder);

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

  type SortableColumn = "Audit_ID" | "User_ID" | "Message_Type_ID" | "Date_Created";

  function handleSort(column: SortableColumn) {
    if (sortColumn === column) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column
      setSortColumn(column);
      setSortOrder("asc");
    }
  }

  function SortIndicator({ column }: { column: SortableColumn }) {
    if (sortColumn === column) {
      return (
        <span className="ml-1">
          {sortOrder === "asc" ? "▲" : "▼"}
        </span>
      );
    }
    return <span className="ml-1 text-gray-400">▽△</span>;
  }

  function downloadAsCSV() {
    if (!results || results.length === 0) return;

    // Create CSV headers
    const headers = ["Audit_ID", "User_ID", "Message", "Note", "Message_Type_ID", "Date_Created"];
    
    // Create CSV rows
    const rows = results.map((row) => [
      row.Audit_ID,
      row.User_ID,
      `"${(row.Message || "").replace(/"/g, '""')}"`, // Escape quotes in message
      `"${(row.Note || "").replace(/"/g, '""')}"`, // Escape quotes in note
      row.Message_Type_ID,
      new Date(row.Date_Created).toLocaleString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Pagination helpers
  const totalPages = results ? Math.ceil(results.length / itemsPerPage) : 1;
  const validPage = Math.max(1, Math.min(currentPage, totalPages));
  
  function goToPage(page: number) {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    setPageInput(String(newPage));
  }

  function handlePageInputChange(value: string) {
    setPageInput(value);
  }

  function handlePageInputSubmit() {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  }

  function handleItemsPerPageChange(value: string) {
    const newItemsPerPage = Math.max(1, parseInt(value, 10) || 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }

  const paginatedResults = results ? results.slice(
    (validPage - 1) * itemsPerPage,
    validPage * itemsPerPage
  ) : [];

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

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {isAdmin && (
          <div className="flex flex-col gap-2">
            <label htmlFor="orgSelect" className="text-sm font-medium text-gray-700">
              Filter by Organization(s) (optional)
            </label>
            <select
              id="orgSelect"
              value=""
              onChange={(e) => {
                const orgIdNum = Number(e.target.value);
                if (orgIdNum && !selectedOrgIds.includes(orgIdNum)) {
                  setSelectedOrgIds((prev) => [...prev, orgIdNum]);
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sponsor Organization</option>
              {sponsorOrgs.map((org) => (
                <option key={org.Org_ID} value={org.Org_ID}>
                  {org.Org_Name}
                </option>
              ))}
            </select>
            {selectedOrgIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedOrgIds.map((orgIdNum) => {
                  const org = sponsorOrgs.find((o) => o.Org_ID === orgIdNum);
                  return (
                    <div
                      key={orgIdNum}
                      className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{org?.Org_Name || `Org ${orgIdNum}`}</span>
                      <button
                        onClick={() => removeOrgId(orgIdNum)}
                        className="text-green-700 hover:text-green-900 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="userIdInput" className="text-sm font-medium text-gray-700">
            Filter by User ID(s) (optional)
          </label>
          <div className="flex gap-2">
            <input
              id="userIdInput"
              type="number"
              placeholder="Enter User ID"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") addUserId();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addUserId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {selectedUserIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUserIds.map((userId) => (
                <div
                  key={userId}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>User {userId}</span>
                  <button
                    onClick={() => removeUserId(userId)}
                    className="text-blue-700 hover:text-blue-900 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="minDate" className="text-sm font-medium text-gray-700">
            Min Date (optional)
          </label>
          <input
            id="minDate"
            type="date"
            value={minDate}
            onChange={(e) => setMinDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="maxDate" className="text-sm font-medium text-gray-700">
            Max Date (optional)
          </label>
          <input
            id="maxDate"
            type="date"
            value={maxDate}
            onChange={(e) => setMaxDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            <>
              {/* Pagination Controls */}
              <div className="mb-4 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
                      Items per page:
                    </label>
                    <input
                      id="itemsPerPage"
                      type="number"
                      min="1"
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{(validPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-semibold">
                      {Math.min(validPage * itemsPerPage, results.length)}
                    </span> of <span className="font-semibold">{results.length}</span> records
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={validPage === 1}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      First
                    </button>
                    <button
                      onClick={() => goToPage(validPage - 1)}
                      disabled={validPage === 1}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => goToPage(validPage + 1)}
                      disabled={validPage === totalPages}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={validPage === totalPages}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Last
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="pageInput" className="text-sm font-medium text-gray-700">
                      Go to page:
                    </label>
                    <input
                      id="pageInput"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput || validPage}
                      onChange={(e) => handlePageInputChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handlePageInputSubmit();
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handlePageInputSubmit}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Go
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 font-medium">
                    Page <span className="text-blue-600">{validPage}</span> of <span className="text-blue-600">{totalPages}</span>
                  </p>
                </div>
              </div>

              <div className="mb-4 flex justify-end">
                <button
                  onClick={downloadAsCSV}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600 uppercase text-xs tracking-wide">
                    <th className="px-4 py-3 border-b cursor-pointer hover:bg-gray-100" onClick={() => handleSort("Audit_ID")}>
                      Audit ID <SortIndicator column="Audit_ID" />
                    </th>
                    <th className="px-4 py-3 border-b cursor-pointer hover:bg-gray-100" onClick={() => handleSort("User_ID")}>
                      User ID <SortIndicator column="User_ID" />
                    </th>
                    <th className="px-4 py-3 border-b">Message</th>
                    <th className="px-4 py-3 border-b">Note</th>
                    <th className="px-4 py-3 border-b cursor-pointer hover:bg-gray-100" onClick={() => handleSort("Message_Type_ID")}>
                      Type ID <SortIndicator column="Message_Type_ID" />
                    </th>
                    <th className="px-4 py-3 border-b cursor-pointer hover:bg-gray-100" onClick={() => handleSort("Date_Created")}>
                      Date <SortIndicator column="Date_Created" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((row) => (
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

            {/* Bottom Pagination Controls */}
            <div className="mt-4 flex items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={validPage === 1}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => goToPage(validPage - 1)}
                  disabled={validPage === 1}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(validPage + 1)}
                  disabled={validPage === totalPages}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={validPage === totalPages}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Last
                </button>
              </div>

              <p className="text-sm text-gray-600 font-medium">
                Page <span className="text-blue-600">{validPage}</span> of <span className="text-blue-600">{totalPages}</span>
              </p>
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}