export type NavItem = { label: string; href: string };

export const siteConfig = {
  name: "Luxol Supermarket",
  // Put your logo file in /public and update this path if the name differs.
  logo: "/logo-png.png",
  phone: "+234 704 390 9799",
  address: "20 Akure Ilesha Rd, Beside AP filling station, Akure, Ondo State, Nigeria",

  promo: {
    text: "Sign up and GET 10% OFF for your first order.",
    linkLabel: "Sign up now",
    href: "/register",
  },

  // Replace "#" with the real profile links.
  socials: [
    { label: "WhatsApp", href: "https://wa.me/2347043909799", icon: "whatsapp" },
    { label: "Facebook", href: "#", icon: "facebook" },
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
    { label: "Email", href: "mailto:hello@luxol.com", icon: "mail" },
  ] as const,

  nav: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Subscription", href: "/subscription" },
    { label: "Meat Box", href: "/meat-box" },
    { label: "My Freezer Planner", href: "/freezer-planner" },
  ] satisfies NavItem[],

  categories: [
    { label: "All Categories", slug: "all" },
    { label: "Meat and Protein", slug: "meat-protein" },
    { label: "Fish & Sea Food", slug: "fish-seafood" },
    { label: "Grains and Staples", slug: "grains-staples" },
    { label: "Vegetables and Produce", slug: "vegetables-produce" },
    { label: "Bakery", slug: "bakery" },
    { label: "Groceries", slug: "groceries" },
    { label: "Drinks", slug: "drinks" },
    { label: "Essentials", slug: "essentials" },
  ],

  footerColumns: [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/shop" },
        { label: "Fish & Seafood", href: "/shop?category=fish-seafood" },
        { label: "Sausages & Processed", href: "/shop?category=sausages-processed" },
        { label: "Vegetables & Produce", href: "/shop?category=vegetables-produce" },
        { label: "Offers & More...", href: "/offers" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Meat Box", href: "/meat-box" },
        { label: "Freezer Planner", href: "/freezer-planner" },
        { label: "Delivery", href: "/delivery" },
        { label: "Membership", href: "/membership" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Luxol", href: "/about" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Returns & Refunds", href: "/returns" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  ] satisfies { title: string; links: NavItem[] }[],
};
