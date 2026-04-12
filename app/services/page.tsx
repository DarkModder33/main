import { EmailCapture } from "@/components/EmailCapture";
import { ActionRail } from "@/components/monetization/ActionRail";
import { AdSenseBlock } from "@/components/monetization/AdSenseBlock";
import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { scheduleLinks } from "@/lib/booking";
import { businessProfile } from "@/lib/business-profile";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import type { ServiceConversionId } from "@/lib/service-conversions";
import {
    ArrowRight,
    CheckCircle2,
    Code,
    Database,
    LineChart,
    Megaphone,
    Server,
    ShoppingCart,
    Smartphone,
    Users,
    Wrench,
    Zap,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export const metadata = createPageMetadata({
  title: "Digital Services | Execution Studio for AI, Web & Automation",
  description:
    "Execution studio for AI systems, websites, automations, and technical delivery. Custom development, blockchain solutions, and professional IT services with transparent pricing.",
  path: "/services",
  imagePath: "/og-services.svg",
  imageAlt: "TradeHax AI Digital Services - Professional execution studio",
  keywords: [
    "AI automation services",
    "custom AI agents",
    "web development",
    "app development",
    "ai development",
    "smart contracts",
    "technical support",
    "IT services",
    "ai consulting",
    "digital services",
    "execution studio",
    "automation workflows",
  ],
});

const servicesFaqs = [
  {
    question: "Which local areas does TradeHax AI serve?",
    answer:
      "We primarily serve Greater Philadelphia and South Jersey, including Atlantic County, while also supporting remote clients nationwide.",
  },
  {
    question: "Do you offer both local and remote support?",
    answer:
      "Yes. Most services are remote-first for fast turnaround, with local support options available for qualifying projects and requests.",
  },
  {
    question: "How do I book the right service quickly?",
    answer:
      "Use our centralized schedule hub to select your service type, then continue through the matching booking option in minutes.",
  },
] as const;

const servicePaths = [
  {
    title: "AI Trading + Strategy",
    summary: "Trading systems, strategy consults, and AI solutions for advanced digital execution.",
    href: scheduleLinks.tradingConsult,
    conversionId: "book_trading_consult" as ServiceConversionId,
    cta: "Start AI Discovery",
  },
  {
    title: "Digital Builds",
    summary: "Websites, apps, cloud architecture, and e-commerce systems with end-to-end delivery.",
    href: scheduleLinks.webDevConsult,
    conversionId: "book_ai_consult" as ServiceConversionId,
    cta: "Start Build Consultation",
  },
  {
    title: "Support + Growth",
    summary: "Repair, IT management, and social media growth for individuals and local businesses.",
    href: scheduleLinks.techSupport,
    conversionId: "book_repair_quote" as ServiceConversionId,
    cta: "Start Support Intake",
  },
] as const;

const servicesPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: absoluteUrl("/services"),
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${absoluteUrl("/services")}#services-catalog`,
      name: "TradeHax AI Professional Services",
      provider: {
        "@type": "LocalBusiness",
        name: "TradeHax AI",
        telephone: businessProfile.contactPhoneE164,
        email: businessProfile.contactEmail,
      },
      areaServed: [
        "Greater Philadelphia",
        "South Jersey",
        "Atlantic County",
        "United States",
      ],
      serviceType: [
        "Web Development",
        "Application Development",
        "Tech Support",
        "Social Media Marketing",
        "AI Consulting",
      ],
      availableChannel: [
        {
          "@type": "ServiceChannel",
          serviceUrl: absoluteUrl("/schedule"),
          availableLanguage: ["English"],
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${absoluteUrl("/services")}#faq`,
      mainEntity: servicesFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Script id="services-page-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(servicesPageJsonLd)}
      </Script>
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-28 md:pb-14">
        {/* Hero Section */}
        <section className="theme-panel p-8 sm:p-12 md:p-16 mb-8 text-center">
          <span className="theme-kicker mb-5">Digital Services</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight font-black text-white tracking-tighter italic uppercase mb-6">
            Execution Studio
          </h1>
          <p className="text-zinc-200 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            AI systems, websites, automations, and technical delivery. Professional execution from discovery to deployment with transparent pricing and clear timelines.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <TrackedCtaLink
              href={scheduleLinks.root}
              conversionId="open_schedule"
              surface="services:hero"
              className="theme-cta theme-cta--loud px-6 py-3"
            >
              Book Service Call
              <ArrowRight className="w-5 h-5" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/portfolio"
              conversionId="open_portfolio"
              surface="services:hero"
              className="theme-cta theme-cta--secondary px-6 py-3"
            >
              View Portfolio
            </TrackedCtaLink>
          </div>
        </section>

        {/* Value Proposition - What You Get */}
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase italic mb-6">What You Get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-cyan-500/10">
                <Code className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Custom AI Agents & Automation</h3>
                <p className="text-sm text-zinc-400">
                  Intelligent workflows, chat agents, data processing pipelines, and custom AI integrations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-purple-500/10">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Full-Stack Web & App Development</h3>
                <p className="text-sm text-zinc-400">
                  Next.js, React, mobile apps, APIs, databasesâ€”complete solutions from prototype to production
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">AI & Tech Systems</h3>
                <p className="text-sm text-zinc-400">
                  AI integrations, automation systems, custom development, and technical consulting
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-amber-500/10">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Technical Support & Optimization</h3>
                <p className="text-sm text-zinc-400">
                  Remote troubleshooting, system cleanup, hardware diagnostics, and IT management
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-rose-500/10">
                <ShoppingCart className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">E-Commerce & Payment Systems</h3>
                <p className="text-sm text-zinc-400">
                  Shopify, WooCommerce, custom stores, payment gateways, and conversion optimization
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-500/10">
                <Megaphone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Social Media & Marketing</h3>
                <p className="text-sm text-zinc-400">
                  Content strategy, community management, paid campaigns, and analytics tracking
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-12">
          <ActionRail surface="services" />
        </div>

        {/* Ad Placement */}
        <div className="mb-16">
          <AdSenseBlock adSlot="services-top" adFormat="horizontal" />
        </div>

        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicePaths.map((path) => (
            <article key={path.title} className="interactive-surface rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 min-h-[190px]">
              <h2 className="text-lg font-bold text-white">{path.title}</h2>
              <p className="mt-2 text-sm text-gray-300">{path.summary}</p>
              <TrackedCtaLink
                href={path.href}
                conversionId={path.conversionId}
                surface={`services:path:${path.title.toLowerCase().replace(/\s+/g, "_")}`}
                external={path.href.startsWith("http")}
                className="theme-cta theme-cta--secondary mt-4"
              >
                {path.cta}
                <ArrowRight className="w-4 h-4" />
              </TrackedCtaLink>
            </article>
          ))}
        </section>

        {/* Services Grid */}
        <details id="full-service-catalog" className="group disclosure-shell mb-16 border-gray-800 bg-gray-900/30" open={false}>
          <summary className="disclosure-summary px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Full Service Catalog</p>
                <p className="text-xs text-gray-400">10 detailed offerings with feature breakdowns and pricing anchors</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-300 shrink-0">
                <span>expand</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-90" />
              </span>
            </div>
          </summary>
          <div className="border-t border-gray-800 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid md:grid-cols-2 gap-8">
          <ServiceCard
            icon={<Code className="w-10 h-10" />}
            title="Custom Development"
            description="Custom web applications, automation systems, and modern platforms built with current technologies."
            features={[
              "Full-stack web development",
              "API integration & design",
              "Automation & workflow systems",
              "Technical architecture",
              "Code review & audits",
            ]}
            pricing="Starting at $5,000"
            ctaLabel="Book AI Consulting Discovery Call"
            ctaHref={scheduleLinks.webDevConsult}
            ctaConversionId="book_ai_consult"
          />

          <ServiceCard
            icon={<LineChart className="w-10 h-10" />}
            title="Trading System Development"
            description="Automated trading bots, algorithmic strategies, real-time market analysis, and exclusive livestream trading sessions."
            features={[
              "Custom trading algorithms",
              "Portfolio management systems",
              "Market data integration",
              "Risk management tools",
              "Backtesting frameworks",
              "Live trading sessions & community (coming soon)",
            ]}
            pricing="Starting at $3,000"
            ctaLabel="Book Trading Strategy Session"
            ctaHref={scheduleLinks.tradingConsult}
            ctaConversionId="book_trading_consult"
          />

          <ServiceCard
            icon={<Users className="w-10 h-10" />}
            title="Consulting & Strategy"
            description="Expert guidance on AI adoption, tech strategy, and digital business models."
            features={[
              "Technical architecture review",
              "AI strategy planning",
              "Process optimization",
              "Team training & workshops",
              "Code review & audits",
            ]}
            pricing="$200/hour"
            ctaLabel="Book Strategy Consult"
            ctaHref={scheduleLinks.webDevConsult}
            ctaConversionId="book_ai_consult"
          />

          <ServiceCard
            icon={<Zap className="w-10 h-10" />}
            title="Full-Stack Development"
            description="Complete web applications with modern frameworks, APIs, and database architecture."
            features={[
              "Next.js & React applications",
              "Backend API development",
              "Database design & optimization",
              "Cloud deployment & DevOps",
              "Performance optimization",
            ]}
            pricing="Starting at $4,000"
            ctaLabel="Start Build Consultation"
            ctaHref={scheduleLinks.webDevConsult}
            ctaConversionId="book_ai_consult"
          />

          <ServiceCard
            icon={<Wrench className="w-10 h-10" />}
            title="Software & Hardware Support"
            description="Remote-first technical support for all your computer needs. Fast diagnostics, troubleshooting, and optimization."
            features={[
              "Remote software troubleshooting & fixes",
              "Hardware diagnostic support",
              "Virus & malware removal",
              "System optimization & cleanup",
              "Data recovery assistance",
              "OS installation & updates",
            ]}
            pricing="$50-100/hour"
            ctaLabel="Book Repair / Support Intake"
            ctaHref={scheduleLinks.techSupport}
            ctaConversionId="book_repair_quote"
          />

          <ServiceCard
            icon={<Megaphone className="w-10 h-10" />}
            title="Social Media Marketing"
            description="Complete social media management and digital marketing services to grow your online presence and engage your audience."
            features={[
              "Social media strategy development",
              "Content creation & scheduling",
              "Community management & engagement",
              "Paid advertising campaigns (FB, IG, TikTok)",
              "SEO optimization & analytics",
              "Influencer outreach & partnerships",
            ]}
            pricing="Starting at $1,000/month"
            ctaLabel="Book Marketing Strategy Call"
            ctaHref={scheduleLinks.socialMediaConsult}
            ctaConversionId="book_social_media_consult"
          />

          <ServiceCard
            icon={<Server className="w-10 h-10" />}
            title="Complete IT Solutions"
            description="End-to-end IT management for businesses. From domain setup to ongoing technical support."
            features={[
              "Domain registration & DNS management",
              "Email hosting & configuration",
              "SSL certificate installation",
              "Website backups & security monitoring",
              "Cloud infrastructure setup",
              "24/7 technical support retainers",
            ]}
            pricing="Starting at $500/month"
            ctaLabel="Book IT Management Consult"
            ctaHref={scheduleLinks.itManagement}
            ctaConversionId="book_it_management_consult"
          />

          <ServiceCard
            icon={<Smartphone className="w-10 h-10" />}
            title="Custom Application Development"
            description="Native mobile apps, web applications, and cross-platform solutions built with modern frameworks."
            features={[
              "iOS & Android app development",
              "Progressive Web Apps (PWA)",
              "React Native cross-platform apps",
              "API development & integration",
              "App Store & Play Store deployment",
              "Ongoing maintenance & updates",
            ]}
            pricing="Starting at $8,000"
            ctaLabel="Book App Development Consult"
            ctaHref={scheduleLinks.appDevelopment}
            ctaConversionId="book_app_development_consult"
          />

          <ServiceCard
            icon={<Database className="w-10 h-10" />}
            title="Database & Cloud Architecture"
            description="Scalable database design, cloud migration, and infrastructure optimization for growing businesses."
            features={[
              "PostgreSQL, MongoDB, MySQL setup",
              "AWS, Google Cloud, Azure deployment",
              "Database optimization & indexing",
              "Cloud cost optimization",
              "Backup & disaster recovery",
              "DevOps & CI/CD pipelines",
            ]}
            pricing="Starting at $3,500"
            ctaLabel="Book Database Architecture Call"
            ctaHref={scheduleLinks.databaseConsult}
            ctaConversionId="book_database_consult"
          />

          <ServiceCard
            icon={<ShoppingCart className="w-10 h-10" />}
            title="E-Commerce Development"
            description="Complete online store setup with payment processing, inventory management, and marketing tools."
            features={[
              "Shopify, WooCommerce, custom builds",
              "Payment gateway integration (Stripe, PayPal)",
              "Inventory & order management",
              "Email marketing automation",
              "Product photography & descriptions",
              "Conversion rate optimization",
            ]}
            pricing="Starting at $6,000"
            ctaLabel="Book E-Commerce Build Session"
            ctaHref={scheduleLinks.ecommerceConsult}
            ctaConversionId="book_ecommerce_consult"
          />
            </div>
          </div>
        </details>

        {/* Process Section */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10 sm:mb-12">
            How We Work
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProcessStep
              number="1"
              title="Discovery"
              description="We discuss your requirements, goals, and technical needs."
            />
            <ProcessStep
              number="2"
              title="Proposal"
              description="Receive a detailed project plan with timeline and pricing."
            />
            <ProcessStep
              number="3"
              title="Development"
              description="Agile development with regular updates and milestones."
            />
            <ProcessStep
              number="4"
              title="Delivery"
              description="Launch, support, and ongoing maintenance as needed."
            />
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sm:p-8 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-7 sm:mb-8 text-center">
            Why Choose TradeHax AI?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Benefit
              title="Cross-Domain Expertise"
              description="Digital services, repair support, education, and AI consulting in one team"
            />
            <Benefit
              title="Fast Delivery"
              description="Agile methodology ensures quick turnaround times"
            />
            <Benefit
              title="Ongoing Support"
              description="Comprehensive post-launch support and maintenance"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 sm:p-8 md:p-12 text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Let&apos;s discuss how we can bring your vision to life with
            cutting-edge technology and proven development practices.
          </p>

          <EmailCapture />

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <TrackedCtaLink
              href={scheduleLinks.root}
              conversionId="open_schedule"
              surface="services:cta_section"
              className="theme-cta theme-cta--loud px-6 py-3"
            >
              Book a Service Call
              <ArrowRight className="w-5 h-5" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/portfolio"
              conversionId="open_portfolio"
              surface="services:cta_section"
              className="theme-cta theme-cta--secondary px-6 py-3"
            >
              View Portfolio
              <ArrowRight className="w-5 h-5" />
            </TrackedCtaLink>
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mb-8">
          <AdSenseBlock adSlot="services-bottom" adFormat="horizontal" />
        </div>

        <section className="theme-panel p-6 sm:p-8 mt-8 mb-10">
          <h2 className="theme-title text-2xl font-bold mb-4">Local Service Coverage</h2>
          <p className="text-[#cdd8ee] mb-3">
            We support clients across <strong>Greater Philadelphia</strong> and <strong>South Jersey</strong>,
            including Atlantic County, with remote-first delivery for faster turnaround.
          </p>
          <p className="text-sm text-[#9ca9c5]">
            Ready to book? Continue to our
            <Link href={scheduleLinks.root} className="ml-1 underline underline-offset-2 hover:text-white">
              service scheduling hub
            </Link>
            .
          </p>
        </section>

        <section className="theme-panel p-6 sm:p-8 mb-8" aria-labelledby="services-faq-heading">
          <h2 id="services-faq-heading" className="theme-title text-2xl font-bold mb-4">
            Services FAQ
          </h2>
          <div className="space-y-3">
            {servicesFaqs.map((faq) => (
              <details key={faq.question} className="rounded-lg border border-[#5f769f]/35 bg-[#0a1422] px-4 py-3">
                <summary className="cursor-pointer font-semibold text-[#e7ecfb]">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-[#b6c3de]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mobile-action-shell md:hidden">
          <div className="mobile-action-grid">
            <TrackedCtaLink
              href={scheduleLinks.root}
              conversionId="open_schedule"
              surface="services:mobile_sticky"
              conversionContext={{ placement: "sticky", variant: "book_now", audience: "all" }}
              className="mobile-action-btn mobile-action-btn--primary"
            >
              Book Now
            </TrackedCtaLink>
            <TrackedCtaLink
              href="#full-service-catalog"
              conversionId="open_service_catalog"
              surface="services:mobile_sticky"
              conversionContext={{ placement: "sticky", variant: "catalog", audience: "all" }}
              className="mobile-action-btn"
            >
              Full Catalog
            </TrackedCtaLink>
          </div>
        </div>
      </main>

    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  features,
  pricing,
  ctaLabel,
  ctaHref,
  ctaConversionId,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  pricing: string;
  ctaLabel: string;
  ctaHref: string;
  ctaConversionId: ServiceConversionId;
}) {
  return (
    <div className="interactive-surface bg-gray-900/50 border border-gray-800 rounded-xl p-5 sm:p-8">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mb-5 sm:mb-6 text-purple-400">
        {icon}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-gray-400 mb-6">{description}</p>

      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-gray-300">
            <CheckCircle2 className="w-5 h-5 text-[#0366d6] flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="pt-6 border-t border-gray-800">
        <p className="text-2xl font-bold text-white">{pricing}</p>
        <TrackedCtaLink
          href={ctaHref}
          conversionId={ctaConversionId}
          surface={`services:card:${title.toLowerCase().replace(/\s+/g, "_")}`}
          external={ctaHref.startsWith("http")}
          className="theme-cta theme-cta--compact mt-4"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </TrackedCtaLink>
      </div>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-r from-[#00D100] to-[#00FF41] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function Benefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

