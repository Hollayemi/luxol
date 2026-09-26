# Subscription checkout — "Membership Subscription" page

Route: /subscription/checkout?plan=silver|gold|family|business (already
linked from each plan's "Subscribe" button on /subscription). An unknown
or missing plan id renders a 404, rather than a broken page.

## New files
- app/data/subscription-checkout-data.ts
  - PROTEIN_OPTIONS (Chicken/Cow Beef/Goat Meat/Assorted Meats — rendered
    as flat icon swatches, not photos: see "On the protein images" below)
  - toggleProtein / adjustAllocation / canDecrease / canIncrease — the
    percentage-allocation logic. Selecting/deselecting rebalances every
    selected protein to an equal share; the +/- stepper moves a protein's
    share by 5 points at a time, pulled from (or given back to) the other
    selected proteins proportionally to their current share. Invariant:
    selected shares always sum to exactly 100 and never drop below 5.
  - DELIVERY_FREQUENCIES / DELIVERY_DAYS / DELIVERY_WINDOWS
- app/subscription/checkout/page.tsx        — banner, breadcrumb, plan lookup
- app/subscription/checkout/CheckoutClient.tsx — all the state + validation
- app/subscription/checkout/components/ProteinCard.tsx
- app/subscription/checkout/components/AddressSection.tsx — see below
- app/subscription/checkout/components/SummaryCard.tsx

## Modified files
- app/components/ui/icons.tsx — added ChickenIcon, CowIcon, GoatIcon,
  MixedMeatIcon (flat line icons, additive exports)
- app/components/ui/form-fields.tsx — MOVED here from
  app/account/components/fields.tsx, so /subscription/checkout can reuse
  the same TextField/SelectField/PhoneField/PasswordField as /account
  instead of duplicating them. app/account/components/PersonalInformationPanel.tsx
  and ManageAddressPanel.tsx now import from the new path (both included
  here again since their import line changed).

## "Select from an existing address"

AddressSection.tsx calls useListAddressesQuery() — the real users RTQ hook
from the previous change, not mock data. When the signed-in person has
saved addresses, a "Saved Address" dropdown appears above the manual
fields; picking one fills Delivery Address / Region / Phone / Additional
Phone from that saved address. Editing any of those fields afterward
clears the "loaded from saved address" marker (so it's clearly being
edited as a one-off, not silently rewriting the saved address). With no
saved addresses (or while logged out), the dropdown just doesn't render
and the fields start blank.

## A mock inconsistency I resolved, not reproduced

In both screenshots, the field next to "Region" was labeled "Full Name"
but behaved like a dropdown, and in the filled-in screenshot its selected
value ("Ayobami Gilbert") matched the name on one of the saved addresses
from your earlier Manage Address mock. Read literally, "Full Name" as a
free-choice dropdown doesn't make sense — so this builds it as what the
data implies it actually is: the saved-address picker, labeled "Saved
Address," per your note that people should be able to select from an
existing address. There's no separate plain "Full Name" field as a result.

## On the protein images

The mock uses stock photography for Chicken/Cow Beef/Goat Meat/Assorted
Meats. None of those exact photos exist in your /public/images, and I
can't pull new images from the web into the repo from here — so instead
of a mismatched or duplicated photo, each card gets a small flat icon on
a tinted background (a distinct, intentional look rather than a
placeholder). Swap in real product photography whenever you have it —
ProteinCard.tsx just needs an `image` field instead of `icon`.

## Not built (out of scope here)

There's no subscriptions backend/RTK Query slice yet, so "Continue to
Payment" simulates a short request and shows a confirmation state
in-page — it doesn't call a real endpoint or reach an actual payment
step. Say the word if you'd like a subscriptionsApi.ts slice (types +
endpoints) to back this next, the same way orders/cart/users were done.

Verified with `tsc --noEmit` and `eslint` against the whole repo (only
the same pre-existing, unrelated warnings elsewhere), plus a dev-server
check: 404 with no/invalid ?plan=, 200 and full content with a valid one,
and confirmed /subscription's "Subscribe" buttons link straight in.
