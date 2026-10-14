import type { Metadata } from "next";
import MeatBoxClient from "./MeatBoxClient";

export const metadata: Metadata = { title: "Meat Box" };

export default function AdminMeatBoxPage() {
  return <MeatBoxClient />;
}
