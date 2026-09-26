import type { Metadata } from "next";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Delivery & Schedule" };

export default function AdminDeliveryPage() {
  return <AdminPageHeader title="Delivery & Schedule" description="Delivery windows and upcoming schedules." />;
}
