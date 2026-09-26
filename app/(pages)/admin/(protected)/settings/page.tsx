import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return <AdminPageHeader title="Settings" description="Your account and store preferences." />;
}
