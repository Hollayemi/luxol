import { MixedMeatIcon } from "@/app/components/ui/icons";
import { formatKg } from "@/app/utils/meat-box";
import { formatNaira } from "@/app/utils/product";
import type { MeatBoxOption } from "@/redux/types";

export default function OptionCard({
  option,
  selected,
  onToggle,
}: {
  option: MeatBoxOption;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-white p-1.5 shadow-sm transition ${
        selected ? "border-luxol-green" : "border-neutral-200"
      }`}
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400">
        {option.image ? (
          // Uploaded by staff (any host), so not next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={option.image} alt="" className="size-full object-cover" />
        ) : (
          <MixedMeatIcon className="size-10" />
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-2.5">
        <p className="text-xs font-semibold text-neutral-900">{option.label}</p>
        <p className="mt-0.5 text-[11px] text-neutral-500">{formatKg(option.weightKg)}</p>
        <p className="mt-1 text-sm font-bold text-luxol-green">{formatNaira(option.price)}</p>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={`${selected ? "Unselect" : "Select"} ${option.label}`}
          className={`mt-3 inline-flex h-8 w-full items-center justify-center rounded-md text-[11px] font-semibold transition ${
            selected
              ? "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              : "bg-luxol-green text-white hover:brightness-110"
          }`}
        >
          {selected ? "Unselect" : "Select"}
        </button>
      </div>
    </div>
  );
}
