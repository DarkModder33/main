import Link from "next/link";
import { ReactNode } from "react";

type IntelligenceRouteCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

export function IntelligenceRouteCard(props: IntelligenceRouteCardProps) {
  const { title, description, href, icon } = props;
  return (
    <article className="theme-grid-card">
      <div className="text-cyan-300">{icon}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-[#afc4d4] text-sm">{description}</p>
      <Link href={href} className="theme-cta theme-cta--loud mt-2 self-start">
        Open
      </Link>
    </article>
  );
}
