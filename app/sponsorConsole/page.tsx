import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
// import SponsorPanel from "@/components/sponsor-panel";
import Navbar from "@/components/navbar";
import SponsorPanel from "@/components/sponsor-panel";
import { PointForm } from "@/components/point-form";

export default async function SponsorPage() {
  const session = await auth();

  // not logged in
  if (!session) redirect("/login");

  // not admin
  if (session.user?.role !== "S") redirect("/dashboard");

  return (
    <>
      <Navbar />
      <SponsorPanel/>
      <PointForm/>
    </>
  );
}
