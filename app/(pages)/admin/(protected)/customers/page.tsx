import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return <AdminPageHeader title="Customers" description="The people who shop with Luxol." />;
}
