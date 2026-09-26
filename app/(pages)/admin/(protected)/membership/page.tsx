import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Membership" };

export default function AdminMembershipPage() {
  return <AdminPageHeader title="Membership" description="Active members, renewals and plans." />;
}
