import type { Metadata } from "next";
import GamePageClient from "./GamePageClient";

export const metadata: Metadata = {
  title: "Hyperborea - 3D Browser Game | TradeHax AI",
  description:
    "Play Hyperborea, an epic Escher-inspired 3D browser game with NFT rewards and blockchain integration. No download required.",
  keywords: [
    "browser game",
    "3D game",
    "Hyperborea",
    "NFT game",
    "free game",
    "blockchain game",
  ],
  openGraph: {
    title: "Hyperborea - 3D Browser Game",
    description:
      "Join 10,000+ players in Hyperborea. Collect clovers, earn power-ups, and mint NFT rewards.",
    url: "https://tradehaxai.tech/game",
    type: "website",
    images: [
      {
        url: "/og-game.svg",
        width: 1200,
        height: 630,
        alt: "Hyperborea Game",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyperborea - 3D Browser Game",
    description:
      "Play Hyperborea on tradehaxai.tech - Free 3D game with NFT rewards",
    images: ["/og-game.svg"],
  },
};

export default function GamePage() {
  return <GamePageClient />;
}
