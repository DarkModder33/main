"use client";

import { useCallback, useEffect, useState } from "react";

interface UseProgramReturn {
  counterValue: number;
  publicKey: string | null;
  connected: boolean;
  increment: () => Promise<string>;
  decrement: () => Promise<string>;
}

const COUNTER_KEY = "tradehax_counter_v1";

function readCounter() {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = window.localStorage.getItem(COUNTER_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeCounter(next: number) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(COUNTER_KEY, String(next));
  window.dispatchEvent(new CustomEvent("tradehax-counter-updated", { detail: { value: next } }));
}

export function useProgram(): UseProgramReturn {
  const [counterValue, setCounterValue] = useState<number>(0);

  useEffect(() => {
    setCounterValue(readCounter());

    const onUpdate = (event: Event) => {
      const custom = event as CustomEvent<{ value?: number }>;
      const value = custom.detail?.value;
      if (typeof value === "number") {
        setCounterValue(value);
        return;
      }
      setCounterValue(readCounter());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === COUNTER_KEY) {
        setCounterValue(readCounter());
      }
    };

    window.addEventListener("tradehax-counter-updated", onUpdate as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("tradehax-counter-updated", onUpdate as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const updateCounter = useCallback(async (delta: number) => {
    const current = readCounter();
    const next = Math.max(0, current + delta);
    writeCounter(next);
    setCounterValue(next);
    return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  const increment = useCallback(async () => updateCounter(1), [updateCounter]);
  const decrement = useCallback(async () => updateCounter(-1), [updateCounter]);

  const connected = false;
  const publicKey = null;

  return {
    counterValue,
    publicKey,
    connected,
    increment,
    decrement,
  };
}
