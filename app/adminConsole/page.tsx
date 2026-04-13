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

export default async function AdminPage() {
  const session = await auth();

  // not logged in
  if (!session) redirect("/login");

  // not admin
  if (session.user?.role !== "A") redirect("/dashboard");

  return (
  <>
    <Navbar />
    <div className="min-h-screen bg-gray-100 text-zinc-900 flex justify-center py-12 px-8 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-6xl flex gap-12">
        
        {/* LEFT SIDE — Forms */}
        <div className="w-1/2 flex flex-col gap-10">
          
          <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
            <h1 className="text-2xl font-bold text-center mb-6">
              Create New User
            </h1>
            <CreateUserForm />
          </div>

          <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
            <h1 className="text-2xl font-bold text-center mb-6">
              Create New Sponsor Organization
            </h1>
            <CreateSponsorForm />
          </div>

          <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
            <h1 className="text-2xl font-bold text-center mb-6">
              Bulk Upload Users
            </h1>
            <BulkUploadDrivers />
          </div>

          <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
            <h1 className="text-2xl font-bold text-center mb-6">
              Bulk Upload Sponsor Orgs
            </h1>
            <BulkUploadSponsorOrgs />
          </div>

          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* RIGHT SIDE — Admin Tools */}
        <div className="w-1/2 bg-white text-zinc-900 shadow-md rounded-lg p-8 h-fit dark:bg-zinc-800 dark:text-zinc-100">
          
          <h2 className="text-xl font-bold mb-6">Admin Data</h2>

          <div className="flex flex-col gap-4">
            <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-700 dark:text-zinc-100">
              <AdminPanel />
            </div>
          </div>

          <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-700 dark:text-zinc-100">
            <h1 className="text-2xl font-bold text-center mb-6">
              Deactivate Users
            </h1>
            <DeactivateUserForm />
          </div>

          <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-700 dark:text-zinc-100">
            <h1 className="text-2xl font-bold text-center mb-6">
              Impersonate User
            </h1>
            <ImpersonateUserForm />
          </div>
        </div>

        <div className="bg-white text-zinc-900 shadow-md rounded-lg p-8 dark:bg-zinc-800 dark:text-zinc-100">
          <h2 className="text-xl font-bold mb-6">Audit Reports</h2>
          <AuditReportPanel orgId={null} isAdmin={true} />
        </div>

      </div>
    </div>
  </>
);
}