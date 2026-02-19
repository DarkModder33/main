const primarySiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://tradehax.net";

export const siteConfig = {
  primarySiteUrl,
  primarySiteDomain: new URL(primarySiteUrl).hostname,
  legacyDomains: ["tradehaxai.tech", "tradehaxai.me"],
} as const;
