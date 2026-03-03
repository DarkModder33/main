"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWallet } from "@/lib/wallet-provider";

import React from "react";

export function WalletButton() {
  const { status, address, connect, disconnect } = useWallet();

  const button =
    status === "CONNECTED" ? (
      <button
        type="button"
        onClick={disconnect}
        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
      </button>
    ) : (
      <button
        type="button"
        onClick={connect}
        className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
      >
        {status === "CONNECTING" ? "Connecting..." : "Connect Wallet"}
      </button>
    );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">{button}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>TradeHax wallet gateway</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
