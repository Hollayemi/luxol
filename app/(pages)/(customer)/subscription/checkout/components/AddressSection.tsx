"use client";

import { SearchIcon } from "@/app/components/ui/icons";
import { inputClass, PhoneField, SelectField } from "@/app/components/ui/form-fields";
import { NIGERIAN_STATES } from "@/app/data/account-data";
import { useListAddressesQuery } from "@/redux/slices/usersApi";

export type AddressFormValue = {
  /** Which saved address (if any) this was loaded from — "" means typed manually. */
  savedAddressId: string;
  address: string;
  region: string;
  phone: string;
  additionalPhone: string;
};

export const EMPTY_ADDRESS_FORM: AddressFormValue = {
  savedAddressId: "",
  address: "",
  region: "",
  phone: "",
  additionalPhone: "",
};

export default function AddressSection({
  value,
  onChange,
}: {
  value: AddressFormValue;
  onChange: (value: AddressFormValue) => void;
}) {
  const { data } = useListAddressesQuery();
  const savedAddresses = data?.data ?? [];

  function handlePickSaved(id: string) {
    if (!id) {
      onChange({ ...EMPTY_ADDRESS_FORM });
      return;
    }
    const saved = savedAddresses.find((a) => a.id === id);
    if (!saved) return;
    onChange({
      savedAddressId: saved.id,
      address: saved.address,
      region: saved.region,
      phone: saved.phone,
      additionalPhone: saved.phone_sec ?? "",
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {savedAddresses.length > 0 && (
        <SelectField
          label="Saved Address"
          hint="Pick one of your saved addresses to fill the fields below, or leave this on 'Enter a new address' to type one in."
          value={value.savedAddressId}
          onChange={(e) => handlePickSaved(e.target.value)}
        >
          <option value="">Enter a new address</option>
          {savedAddresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.fullName} — {a.address}
            </option>
          ))}
        </SelectField>
      )}

      <div>
        <label htmlFor="checkout-address" className="mb-2 block text-sm font-semibold text-neutral-900">
          Delivery Address
        </label>
        <div className="relative">
          <input
            id="checkout-address"
            type="text"
            placeholder="Enter your address"
            value={value.address}
            onChange={(e) =>
              onChange({ ...value, savedAddressId: "", address: e.target.value })
            }
            className={`${inputClass} pr-12`}
          />
          <SearchIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Region"
          hint="We use this to calculate delivery fees and estimated delivery time."
          value={value.region}
          onChange={(e) => onChange({ ...value, savedAddressId: "", region: e.target.value })}
        >
          <option value="" disabled>
            Select a state
          </option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>

        <PhoneField
          label="Phone Number"
          placeholder="Enter number"
          value={value.phone}
          onChange={(e) => onChange({ ...value, savedAddressId: "", phone: e.target.value })}
        />
      </div>

      <PhoneField
        label="Additional Phone Number"
        placeholder="Enter number"
        value={value.additionalPhone}
        onChange={(e) =>
          onChange({ ...value, savedAddressId: "", additionalPhone: e.target.value })
        }
      />
    </div>
  );
}
