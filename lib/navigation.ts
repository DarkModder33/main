import { scheduleLinks } from "@/lib/booking";

export interface AppNavItem {
  name: string;
  href: string;
  submenu?: Array<{ name: string; href: string }>;
}

export const ecosystemSubmenu: Array<{ name: string; href: string }> = [
  { name: "AI Hub", href: "/ai-hub" },
  { name: "Intelligence Hub", href: "/intelligence" },
  { name: "Trading Dashboard", href: "/trading" },
  { name: "Investor Academy", href: "/investor-academy" },
  { name: "Games Hub", href: "/games" },
  { name: "Music Platform", href: "/music" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
];

export const shamrockNavigation: AppNavItem[] = [
  { name: "Home", href: "/" },
  { name: "Schedule", href: "/schedule" },
  { name: "Pricing", href: "/pricing" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  {
    name: "Ecosystem",
    href: "/ai-hub",
    submenu: ecosystemSubmenu,
  },
];

export const focusedShamrockNavigation: AppNavItem[] = [
  { name: "Home", href: "/" },
  { name: "AI Hub", href: "/ai-hub" },
  { name: "Intelligence", href: "/intelligence" },
  { name: "Pricing", href: "/pricing" },
  { name: "Schedule", href: "/schedule" },
];

export const globalTopNavLinks: Array<{ label: string; href: string; emphasized?: boolean }> = [
  { label: "AI Hub", href: "/ai-hub", emphasized: true },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Schedule", href: "/schedule" },
  { label: "Music", href: "/music" },
  { label: "Games", href: "/games" },
];

export const mobileMenuLinks: Array<{ name: string; href: string; icon: string }> = [
  { name: "AI Hub", href: "/ai-hub", icon: "🤖" },
  { name: "Intelligence", href: "/intelligence", icon: "📊" },
  { name: "Services", href: "/services", icon: "🛠️" },
  { name: "Schedule", href: "/schedule", icon: "📅" },
  { name: "Pricing", href: "/pricing", icon: "💳" },
  { name: "Music", href: "/music", icon: "🎸" },
  { name: "Games", href: "/games", icon: "🎮" },
  { name: "Lessons", href: scheduleLinks.guitarLessons, icon: "📚" },
];

export const dashboardNavLinks: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/trading", label: "Trading" },
  { href: "/billing", label: "Billing" },
  { href: "/account", label: "Account" },
];
