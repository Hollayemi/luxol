import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return <AdminPageHeader title="Orders" description="Every customer order in one place." />;
}
