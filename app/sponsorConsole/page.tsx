import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
// import SponsorPanel from "@/components/sponsor-panel";
import Navbar from "@/components/navbar";
import SponsorPanel from "@/components/sponsor-panel";
import { PointForm } from "@/components/point-form";
import { PointConversionForm } from "@/components/point-conversion-form";
import { AuditReportPanel } from "@/components/audit-report-panel";

export default async function SponsorPage() {
  const session = await auth();

  // not logged in
  if (!session) redirect("/login");

  // not admin
  if (session.user?.role !== "S") redirect("/dashboard");

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 flex justify-center py-12 px-8">
        <div className="w-full max-w-6xl flex gap-12">
          {/* LEFT SIDE — Forms */}
          <div className="w-1/2 flex flex-col gap-10">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Update Driver Points
              </h1>
              <PointForm />
            </div>
            <div className="bg-white shadow-md rounded-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Update Conversion Rate
              </h1>
              <PointConversionForm />
            </div>

            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* RIGHT SIDE — Sponsor Tools */}
          <div className="w-1/2 bg-white shadow-md rounded-lg p-8 h-fit">
            <h2 className="text-xl font-bold mb-6">Sponsor Data</h2>
            <div className="flex flex-col gap-4">
              <div className="bg-white shadow-md rounded-lg p-8">
                <SponsorPanel />
              </div>
            </div>
          </div>
          {/* BOTTOM ROW — Audit Reports */}
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">Audit Reports</h2>
            <AuditReportPanel />
          </div>
        </div>
      </div>
    </>
  );
}
