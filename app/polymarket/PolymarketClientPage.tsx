"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PolymarketClientPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/crypto-project");
  }, [router]);
  return null;
}
