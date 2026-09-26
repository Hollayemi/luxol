/**
 * Data for the /subscription (membership) page — same plain
 * types + mock data + helper pattern as app/data/orders-data.ts.
 */

export type HowItWorksStep = {
  title: string;
  description: string;
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Choose your plan",
    description:
      "Pick the protein plan that fits your household or business and select your preferred delivery details.",
  },
  {
    title: "Subscribe & pay",
    description:
      "Complete your subscription and set up your payment method for your recurring monthly payment.",
  },
  {
    title: "We prepare your supply",
    description:
      "Luxol prepares your weekly protein allocation according to your selected plan.",
  },
  {
    title: "Receive it every week",
    description:
      "Your protein is delivered on schedule, so you don't have to remember to reorder every week.",
  },
];

export type MembershipPlan = {
  id: string;
  name: string;
  /** Monthly price in NGN. */
  price: number;
  description: string;
  supply: string[];
  href: string;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "silver",
    name: "Silver",
    price: 30000,
    description: "For individuals and smaller households",
    supply: ["Beef", "Assorted meat"],
    href: "/subscription/checkout?plan=silver",
  },
  {
    id: "gold",
    name: "Gold",
    price: 50000,
    description: "For households that want more variety",
    supply: ["Premium beef", "Goat meat", "Chicken"],
    href: "/subscription/checkout?plan=gold",
  },
  {
    id: "family",
    name: "Family",
    price: 200000,
    description: "For larger households to get more varieties.",
    supply: ["Mixed proteins", "Larger household quantities", "Priority delivery"],
    href: "/subscription/checkout?plan=family",
  },
  {
    id: "business",
    name: "Business",
    price: 500000,
    description: "For restaurants, caterers and food businesses",
    supply: [
      "High-volume protein supply",
      "Regular scheduled deliveries",
      "Priority fulfilment",
      "Business-focused pricing",
    ],
    href: "/subscription/checkout?plan=business",
  },
];

export const FLEXIBILITY_POINTS: string[] = [
  "Pause your membership when you need a break.",
  "Skip an upcoming delivery when you don't need one.",
  "Resume when you're ready.",
  "Upgrade or downgrade as your needs change.",
  "Cancel whenever you choose.",
];

const priceFmt = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 30000 -> "₦30,000" */
export function formatPlanPrice(amount: number): string {
  return priceFmt.format(amount);
}
