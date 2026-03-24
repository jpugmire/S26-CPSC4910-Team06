import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import SponsorPanel from "@/components/sponsor-panel";
import { PointForm } from "@/components/point-form";
import { PointConversionForm } from "@/components/point-conversion-form";
import { DriverApplicationsList } from "@/components/sponsor/driver-applications-list";
import { AuditReportPanel } from "@/components/audit-report-panel";
import { prisma } from "@/lib/prisma";
import BulkUpdatePoints from "@/components/sponsor-nulk-update-points";

export default async function SponsorPage() {
  const session = await auth();

  // not logged in
  if (!session) redirect("/login");

  // not a sponsor
  if (session.user?.role !== "S") redirect("/dashboard");

  // look up the sponsor's org — sponsors always have a role of "S", never "A"
  const sponsorRecord = await prisma.sponsor.findFirst({
    where: { User_ID: Number(session.user?.id) },
    select: { Org_ID: true },
  });

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
            <div className="bg-white shadow-md rounded-lg p-8">
              <DriverApplicationsList />
            </div>

            <div className="bg-white shadow-md rounded-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Bulk Add Points
              </h1>
              <BulkUpdatePoints />
            </div>

            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* RIGHT SIDE — Sponsor Tools */}
          <div className="w-1/2 flex flex-col gap-10">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h2 className="text-xl font-bold mb-6">Sponsor Data</h2>
              <SponsorPanel />
            </div>
            <div className="bg-white shadow-md rounded-lg p-8">
              <h2 className="text-xl font-bold mb-6">Audit Reports</h2>
              {/* pass orgId so the API scopes results to this sponsor's org */}
              <AuditReportPanel orgId={sponsorRecord?.Org_ID ?? null} isAdmin={false} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}