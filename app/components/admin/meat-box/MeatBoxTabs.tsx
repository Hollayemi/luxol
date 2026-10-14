"use client";

export type MeatBoxTab = "orders" | "catalogue";

const TABS: { value: MeatBoxTab; label: string }[] = [
  { value: "orders", label: "Orders" },
  { value: "catalogue", label: "Options & Categories" },
];

export type MeatBoxTabsProps = {
  value: MeatBoxTab;
  onChange: (value: MeatBoxTab) => void;
};

/** Orders / Options & Categories, styled like the tabs on the Orders page. */
export function MeatBoxTabs({ value, onChange }: MeatBoxTabsProps) {
  return (
    <div role="tablist" aria-label="Meat Box sections" className="flex flex-wrap items-center gap-1">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`meat-box-tab-${tab.value}`}
            aria-selected={active}
            aria-controls={`meat-box-panel-${tab.value}`}
            onClick={() => onChange(tab.value)}
            className={`flex h-10 items-center rounded-xl px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-luxol-green ${
              active ? "bg-[#c9e6c4] font-medium text-neutral-900" : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
