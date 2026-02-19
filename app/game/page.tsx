import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import GamePageClient from "./GamePageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Hyperborea - 3D Browser Game | TradeHax AI",
  description:
    "Play Hyperborea, an Escher-inspired 3D browser puzzle game with leaderboard scoring and optional wallet-linked rewards.",
  path: "/game",
  imagePath: "/og-game.svg",
  imageAlt: "Hyperborea 3D browser game preview",
  keywords: [
    "browser game",
    "3d game",
    "hyperborea",
    "nft game",
    "free game",
    "blockchain game",
    "puzzle game",
  ],
});

export default function GamePage() {
  return <GamePageClient />;
}
