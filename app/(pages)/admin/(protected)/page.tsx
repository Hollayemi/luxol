import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return (
    <AdminPageHeader
      title="Business Overview"
      description="Here's a quick look at how Luxol is performing today."
    />
  );
}
