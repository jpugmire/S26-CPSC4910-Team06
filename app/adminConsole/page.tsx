import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateUserForm } from "@/components/userCreate-form";
import { CreateSponsorForm } from "@/components/sponsorOrgCreate-form";
import { DeactivateUserForm } from "@/components/deactivate-form"
import Link from "next/link";
import AdminPanel from "@/components/admin-panel";
import Navbar from "@/components/navbar";
import BulkUploadDrivers from "@/components/admin-bulk-upload";
import BulkUploadSponsorOrgs from "@/components/admin-bulk-upload-sponsorOrg";
import { AuditReportPanel } from "@/components/audit-report-panel";
import { ImpersonateUserForm } from "@/components/impersonation-form";
import { DriverAffiliationsPanel } from "@/components/admin-driver-affiliations";

export default async function AdminPage() {
  const session = await auth();

  // not logged in
  if (!session) redirect("/login");

  // not admin
  if (session.user?.role !== "A") redirect("/dashboard");

  return (
  <>
    <Navbar />
    <div className="min-h-screen bg-gray-100 text-zinc-900 py-12 px-8 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">

        {/* ROW 1 — Forms + Admin Tools */}
        <div className="flex gap-8 items-start">

          {/* LEFT — Forms */}
          <div className="w-1/2 flex flex-col gap-6">
            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
              <h1 className="text-2xl font-bold text-center mb-6">Create New User</h1>
              <CreateUserForm />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
              <h1 className="text-2xl font-bold text-center mb-6">Create New Sponsor Organization</h1>
              <CreateSponsorForm />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
              <h1 className="text-2xl font-bold text-center mb-6">Bulk Upload Users</h1>
              <BulkUploadDrivers />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
              <h1 className="text-2xl font-bold text-center mb-6">Bulk Upload Sponsor Orgs</h1>
              <BulkUploadSponsorOrgs />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="text-xl font-bold mb-4">Audit Reports</h2>
              <AuditReportPanel orgId={null} isAdmin={true} />
            </div>
          </div>

          {/* RIGHT — Admin Tools */}
          <div className="w-1/2 flex flex-col gap-4">
            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="text-xl font-bold mb-4">Admin Data</h2>
              <AdminPanel />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
              <h1 className="text-xl font-bold text-center mb-4">Deactivate Users</h1>
              <DeactivateUserForm />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
              <h1 className="text-xl font-bold text-center mb-4">Impersonate User</h1>
              <ImpersonateUserForm />
            </div>

            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-6 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="text-xl font-bold mb-4">Driver Affiliations</h2>
              <DriverAffiliationsPanel />
            </div>
          </div>
        </div>

      </div>
    </div>
  </>
);
}