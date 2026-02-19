"use client";

import { formatUsd } from "@/lib/intelligence/format";
import { useMemo, useState } from "react";

export function PositionCalculatorPanel() {
  const [accountSize, setAccountSize] = useState("25000");
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState("100");
  const [stop, setStop] = useState("96");
  const [target, setTarget] = useState("112");

  const result = useMemo(() => {
    const account = Number(accountSize);
    const riskPercentage = Number(riskPct);
    const entryPrice = Number(entry);
    const stopPrice = Number(stop);
    const targetPrice = Number(target);

    if (
      !Number.isFinite(account) ||
      !Number.isFinite(riskPercentage) ||
      !Number.isFinite(entryPrice) ||
      !Number.isFinite(stopPrice) ||
      !Number.isFinite(targetPrice) ||
      account <= 0 ||
      riskPercentage <= 0 ||
      entryPrice <= 0 ||
      stopPrice <= 0 ||
      targetPrice <= 0 ||
      entryPrice === stopPrice
    ) {
      return null;
    }

    const riskBudgetUsd = account * (riskPercentage / 100);
    const perUnitRisk = Math.abs(entryPrice - stopPrice);
    const quantity = Math.floor(riskBudgetUsd / perUnitRisk);
    const notional = quantity * entryPrice;
    const rewardPerUnit = Math.abs(targetPrice - entryPrice);
    const potentialRewardUsd = rewardPerUnit * quantity;
    const riskReward = potentialRewardUsd / riskBudgetUsd;

    return {
      riskBudgetUsd,
      perUnitRisk,
      quantity,
      notional,
      potentialRewardUsd,
      riskReward,
    };
  }, [accountSize, riskPct, entry, stop, target]);

  return (
    <section className="theme-panel p-5 sm:p-6">
      <p className="theme-kicker mb-3">Risk Planner</p>
      <h2 className="theme-title text-2xl mb-4">Position Size Calculator</h2>
      <p className="text-sm text-[#a8bfd1] mb-5">
        Enter account, risk %, entry, stop, and target to produce a trade-ready sizing plan.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input label="Account Size" value={accountSize} onChange={setAccountSize} />
        <Input label="Risk %" value={riskPct} onChange={setRiskPct} />
        <Input label="Entry" value={entry} onChange={setEntry} />
        <Input label="Stop" value={stop} onChange={setStop} />
        <Input label="Target" value={target} onChange={setTarget} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ResultCard
          label="Risk Budget"
          value={result ? formatUsd(result.riskBudgetUsd) : "--"}
          hint="Max loss per trade"
        />
        <ResultCard
          label="Suggested Size"
          value={result ? `${result.quantity.toLocaleString()} units` : "--"}
          hint="Rounded down for discipline"
        />
        <ResultCard
          label="Position Notional"
          value={result ? formatUsd(result.notional) : "--"}
          hint="Capital at entry"
        />
        <ResultCard
          label="Per Unit Risk"
          value={result ? formatUsd(result.perUnitRisk) : "--"}
          hint="Entry to stop distance"
        />
        <ResultCard
          label="Potential Reward"
          value={result ? formatUsd(result.potentialRewardUsd) : "--"}
          hint="Entry to target estimate"
        />
        <ResultCard
          label="Risk / Reward"
          value={result ? result.riskReward.toFixed(2) : "--"}
          hint="Higher is usually better"
        />
      </div>
    </section>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
      {props.label}
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
      />
    </label>
  );
}

function ResultCard(props: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">{props.label}</p>
      <p className="text-lg font-bold text-white">{props.value}</p>
      <p className="text-xs text-[#8ea8be]">{props.hint}</p>
    </article>
  );
}
