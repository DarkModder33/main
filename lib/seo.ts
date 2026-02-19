import type { Metadata } from "next";

import { businessProfile } from "@/lib/business-profile";
import { siteConfig } from "@/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  imagePath?: string;
  imageAlt?: string;
  robots?: Metadata["robots"];
};

const defaultImagePath = "/opengraph-image";
const defaultImageAlt =
  "TradeHax AI: web development, repair, music lessons, and Web3 consulting";

export function absoluteUrl(path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const hasPath = normalizedPath !== "/";
  return hasPath
    ? new URL(normalizedPath, siteConfig.primarySiteUrl).toString()
    : siteConfig.primarySiteUrl;
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  imagePath = defaultImagePath,
  imageAlt = defaultImageAlt,
  robots,
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = imagePath.startsWith("http") ? imagePath : absoluteUrl(imagePath);

  return {
    title,
    description,
    keywords,
    robots,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "TradeHax AI",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@tradehaxai",
      site: "@tradehaxai",
    },
  };
}

export function getLocalBusinessJsonLd() {
  const sameAs = [
    businessProfile.socialLinks.x,
    businessProfile.socialLinks.youtube,
    businessProfile.socialLinks.github,
    businessProfile.socialLinks.facebook,
    businessProfile.socialLinks.instagram,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.primarySiteUrl}#organization`,
        name: "TradeHax AI",
        url: siteConfig.primarySiteUrl,
        sameAs,
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteConfig.primarySiteUrl}#localbusiness`,
        name: "TradeHax AI",
        url: siteConfig.primarySiteUrl,
        image: absoluteUrl(defaultImagePath),
        telephone: businessProfile.contactPhoneE164,
        email: businessProfile.contactEmail,
        priceRange: "$$",
        areaServed: [
          "Greater Philadelphia",
          "South Jersey",
          "United States",
        ],
        serviceArea: {
          "@type": "GeoCircle",
          geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: 39.9526,
            longitude: -75.1652,
          },
          geoRadius: 50000,
        },
        makesOffer: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web Development" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tech Repair and Support" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Online Guitar Lessons" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web3 Consulting" } },
        ],
      },
    ],
  };
}
