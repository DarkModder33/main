import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

import { SiteNavigatorWidget } from "@/components/ai/SiteNavigatorWidget";
import { ChainSessionProvider } from "@/components/counter/provider/ChainSession";
import { HyperboreaIntroOverlay } from "@/components/intro/HyperboreaIntroOverlay";
import { GamifiedOnboarding } from "@/components/onboarding/GamifiedOnboarding";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { CinematicFxLayer } from "@/components/ui/CinematicFxLayer";
import { CyberCursor } from "@/components/ui/CyberCursor";
import { MarketTicker } from "@/components/ui/MarketTicker";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrefetchController } from "@/components/ui/PrefetchController";
import { ServiceWorkerCleanup } from "@/components/ui/ServiceWorkerCleanup";
import { getLocalBusinessJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { WalletProvider } from "@/lib/wallet-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
  ],
};

export const metadata: Metadata = {
  title: "TradeHax AI | Digital Services, Repair, Music Lessons, and Web3",
  description: "Professional services for websites, apps, device repair, music lessons, and Web3 consulting for local and remote clients.",
  keywords: [
    "web development philadelphia",
    "app development services",
    "computer repair philadelphia",
    "cell phone repair south jersey",
    "online guitar lessons",
    "multi-chain development services",
    "blockchain consulting",
    "website design for small business",
    "device repair",
    "guitar lessons",
    "digital services",
    "Philadelphia",
    "Greater Philadelphia",
  ],
  authors: [{ name: "TradeHax AI" }],
  creator: "TradeHax AI",
  publisher: "TradeHax AI",
  metadataBase: new URL(siteConfig.primarySiteUrl),
  alternates: {
    canonical: siteConfig.primarySiteUrl,
  },
  openGraph: {
    title: "TradeHax AI | Digital Services, Repair, Music Lessons, and Web3",
    description: "Customer-first services for websites, apps, device repair, music lessons, and Web3 consulting for local and remote clients.",
    url: siteConfig.primarySiteUrl,
    siteName: "TradeHax AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TradeHax AI services for web development, repair, music, and Web3",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeHax AI | Professional Digital and Local Service Support",
    description: "Book web development, repair, lessons, and Web3 services with a clear service path and fast response.",
    images: ["/og-image.jpg"],
    creator: "@tradehaxai",
    site: "@tradehaxai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessJsonLd = getLocalBusinessJsonLd();
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const safeGaMeasurementId =
    gaMeasurementId && /^G-[A-Z0-9]+$/.test(gaMeasurementId) ? gaMeasurementId : null;

  const navItems = [
    { label: "Home", href: "/" },
    {
      label: "Services",
      href: "/services",
      subItems: [
        { label: "Overview", href: "/services" },
        { label: "Pricing", href: "/pricing" },
        { label: "Book", href: "/schedule" },
      ],
    },
    {
      label: "Music",
      href: "/music",
      subItems: [
        { label: "Lessons", href: "/music/lessons" },
        { label: "Showcase", href: "/music/showcase" },
        { label: "Scholarships", href: "/music/scholarships" },
      ],
    },
    {
      label: "Intelligence",
      href: "/intelligence",
      subItems: [
        { label: "AI Hub", href: "/ai-hub" },
        { label: "Signals", href: "/intelligence" },
      ],
    },
    { label: "About", href: "/about" },
    { label: "Schedule", href: "/schedule" },
  ];

  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to Google Fonts and CDN origins to reduce latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS-prefetch for analytics and other third-party origins */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <Script id="tradehax-localbusiness-jsonld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(localBusinessJsonLd)}
        </Script>
        {safeGaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${safeGaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${safeGaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.className} bg-black antialiased`}>
        <WebVitalsReporter />
        <a
          href="#global-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:border focus:border-cyan-300/70 focus:bg-black focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-wider focus:text-cyan-100"
        >
          Skip to content
        </a>
        <AuthProvider>
          <ServiceWorkerCleanup />
          <PrefetchController />
          <CinematicFxLayer />
          <CyberCursor />
          <HyperboreaIntroOverlay />
          <ChainSessionProvider>
            <WalletProvider>
              <nav
                id="global-top-nav"
                aria-label="Primary"
                className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5"
              >
                <MarketTicker />
                <div className="layout-shell container mx-auto h-16 flex items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xl font-black tracking-tighter text-white">
                    TRADEHAX
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-sm font-semibold tracking-[0.12em] text-zinc-200">
                    {navItems.map((item) => (
                      <div key={item.label} className="relative group">
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          {item.label}
                          {item.subItems ? <span className="text-[10px] leading-none">▾</span> : null}
                        </Link>
                        {item.subItems ? (
                          <div className="absolute left-0 top-full z-20 hidden min-w-[220px] rounded-3xl border border-slate-800 bg-slate-950/95 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.35)] group-hover:block group-focus-within:block">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block rounded-2xl px-3 py-2 text-sm text-zinc-300 hover:bg-slate-900 hover:text-white transition-colors"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <MobileMenu />
                </div>
              </nav>
              <main id="global-main-content" role="main" className="bg-cyber-grid pt-24 sm:pt-28">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
              <a
                href="/ai-hub"
                aria-label="Open AI Hub quick launch"
                className="fixed bottom-4 left-3 z-40 hidden sm:inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-cyan-100 shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all hover:bg-cyan-500/30 hover:text-white md:bottom-8 md:left-8"
              >
                <span aria-hidden>⚡</span>
                <span>AI Quick Launch</span>
              </a>
              <SiteNavigatorWidget />
              <GamifiedOnboarding />
            </WalletProvider>
          </ChainSessionProvider>
          <Toaster position="bottom-right" theme="dark" closeButton />
          <Analytics />
          <ShamrockFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

