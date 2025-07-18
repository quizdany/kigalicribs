
export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mainNav: NavItem[];
  footerNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "Kigali Cribs",
  description:
    "Your trusted platform for renting properties in Rwanda, featuring smart search, fair price indicators, and digital lease agreements. Kigali Cribs is your trusted partner.",
  url: "https://cribsink.rw", // Updated URL
  ogImage: "https://cribsink.rw/og.jpg", // Updated OG image URL
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Search Properties",
      href: "/search",
    },
    {
      title: "List a Property",
      href: "/list-property",
    },
    {
      title: "Register",
      href: "/register",
    },
    // Conditional links like "My Profile" or "Login/Logout" will be handled in Header component
  ],
  footerNav: [
    {
      title: "About Us",
      href: "/about",
    },
    {
      title: "Contact",
      href: "/contact",
    },
    {
      title: "Terms of Service",
      href: "/terms",
    },
    {
      title: "Privacy Policy",
      href: "/privacy",
    },
  ],
};
