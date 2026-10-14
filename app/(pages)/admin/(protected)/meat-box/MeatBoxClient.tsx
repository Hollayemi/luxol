"use client";

import { useState } from "react";
import AdminPageHeader from "@/app/components/admin/AdminPageHeader";
import { MeatBoxCatalogueTab } from "@/app/components/admin/meat-box/MeatBoxCatalogueTab";
import { MeatBoxOrdersTab } from "@/app/components/admin/meat-box/MeatBoxOrdersTab";
import { MeatBoxTabs, type MeatBoxTab } from "@/app/components/admin/meat-box/MeatBoxTabs";

/**
 * The Meat Box admin page: attend to orders (weigh, price, move along) on one
 * tab, and manage what customers can order (categories and their options) on
 * the other. Only the active tab is mounted, so the Orders tab stops polling
 * while staff are editing the catalogue.
 */
export default function MeatBoxClient() {
  const [tab, setTab] = useState<MeatBoxTab>("orders");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Meat Box"
        description="Manage what customers can order and attend to their Meat Box orders."
      />

      <MeatBoxTabs value={tab} onChange={setTab} />

      <div role="tabpanel" id={`meat-box-panel-${tab}`} aria-labelledby={`meat-box-tab-${tab}`}>
        {tab === "orders" ? <MeatBoxOrdersTab /> : <MeatBoxCatalogueTab />}
      </div>
    </div>
  );
}
