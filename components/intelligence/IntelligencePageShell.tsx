import Link from "next/link";
import { ReactNode } from "react";

type QuickLink = {
  label: string;
  href: string;
};

type IntelligencePageShellProps = {
  kicker: string;
  title: string;
  description: string;
  quickLinks?: QuickLink[];
  children: ReactNode;
};

export function IntelligencePageShell(props: IntelligencePageShellProps) {
  const { kicker, title, description, quickLinks = [], children } = props;

  return (
    <section className="space-y-6">
      <div className="theme-panel p-6 sm:p-8">
        <p className="theme-kicker mb-3">{kicker}</p>
        <h1 className="theme-title text-3xl sm:text-4xl mb-4">{title}</h1>
        <p className="text-[#a7bfd2] max-w-3xl">{description}</p>
        {quickLinks.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="theme-cta theme-cta--secondary text-xs px-3 py-1.5"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
