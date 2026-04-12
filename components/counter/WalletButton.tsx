"use client";

import Link from "next/link";

export function WalletButton() {
  return (
    <Link
      href="/schedule"
      className="inline-flex min-w-[180px] items-center justify-center rounded-md border border-white/20 bg-black px-4 py-2 text-xs font-mono tracking-wide text-cyan-300 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
    >
      Book a Session
    </Link>
  );
}
