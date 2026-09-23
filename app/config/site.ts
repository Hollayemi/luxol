// Shared site chrome data for the Header and Footer.
// Keeping this in one file means nav links, categories and footer columns
// only need to be updated in a single place.

export const SITE = {
  name: "Luxol Market",
  phone: "+234-901-234-5678",
  email: "hello@luxolmarket.com",
  address: ["24 Oyemekun Road, Akure, Ondo State,", "Nigeria"],
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Subscription", href: "/subscription" },
  { label: "Meat Box", href: "/meat-box" },
  { label: "My Freezer Planner", href: "/freezer-planner" },
] as const;

export const CATEGORIES = [
  { label: "Meat and Protein", href: "/shop/meat-and-protein" },
  { label: "Fish & Sea Food", href: "/shop/fish-and-sea-food" },
  { label: "Grains and Staples", href: "/shop/grains-and-staples" },
  { label: "Vegetables and Produce", href: "/shop/vegetables-and-produce" },
  { label: "Bakery", href: "/shop/bakery" },
  { label: "Groceries", href: "/shop/groceries" },
  { label: "Drinks", href: "/shop/drinks" },
  { label: "Essentials", href: "/shop/essentials" },
] as const;

export const SOCIAL_LINKS = [
  { label: "WhatsApp", icon: "whatsapp", href: "https://wa.me/2349012345678" },
  { label: "Facebook", icon: "facebook", href: "https://facebook.com" },
  { label: "Instagram", icon: "instagram", href: "https://instagram.com" },
  { label: "LinkedIn", icon: "linkedin", href: "https://linkedin.com" },
  { label: "Email", icon: "mail", href: "mailto:hello@luxolmarket.com" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Fish & Seafood", href: "/shop/fish-and-sea-food" },
      { label: "Sausages & Processed", href: "/shop/sausages-and-processed" },
      { label: "Vegetables & Produce", href: "/shop/vegetables-and-produce" },
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
      { label: "Returns & Refunds", href: "/returns-refunds" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
] as const;