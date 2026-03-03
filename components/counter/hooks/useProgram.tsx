"use client";

import { useWallet } from "@/lib/wallet-provider";

type CounterAccount = { count: number };
type AccountChangeCallback = (accountInfo: { data: Uint8Array }) => void;

const globalCounterState = (globalThis as typeof globalThis & {
  __TRADEHAX_COUNTER__?: {
    value: number;
    listeners: Map<number, AccountChangeCallback>;
    nextListenerId: number;
  };
}).__TRADEHAX_COUNTER__ ?? {
  value: 0,
  listeners: new Map<number, AccountChangeCallback>(),
  nextListenerId: 1,
};

(globalThis as typeof globalThis & { __TRADEHAX_COUNTER__?: typeof globalCounterState }).__TRADEHAX_COUNTER__ = globalCounterState;

function encodeCounterValue(value: number): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ count: value }));
}

function notifyCounterListeners() {
  const payload = { data: encodeCounterValue(globalCounterState.value) };
  for (const callback of globalCounterState.listeners.values()) {
    callback(payload);
  }
}

function createProgramApi() {
  return {
    methods: {
      increment: () => ({
        accounts: (_accounts?: unknown) => ({
          rpc: async () => {
            globalCounterState.value += 1;
            notifyCounterListeners();
            return `tx_${Date.now().toString(36)}`;
          },
        }),
      }),
      decrement: () => ({
        accounts: (_accounts?: unknown) => ({
          rpc: async () => {
            globalCounterState.value -= 1;
            notifyCounterListeners();
            return `tx_${Date.now().toString(36)}`;
          },
        }),
      }),
    },
    account: {
      counter: {
        fetch: async (_counterAddress?: unknown) => ({ count: globalCounterState.value }),
      },
    },
    coder: {
      accounts: {
        decode: (_name: string, data: Uint8Array): CounterAccount => {
          try {
            const decoded = JSON.parse(new TextDecoder().decode(data)) as CounterAccount;
            return { count: Number(decoded.count) || 0 };
          } catch {
            return { count: globalCounterState.value };
          }
        },
      },
    },
  };
}

function createConnectionApi() {
  return {
    onAccountChange: (
      _counterAddress: unknown,
      callback: AccountChangeCallback,
      _options?: unknown,
    ) => {
      const id = globalCounterState.nextListenerId;
      globalCounterState.nextListenerId += 1;
      globalCounterState.listeners.set(id, callback);
      return id;
    },
    removeAccountChangeListener: async (id: number) => {
      globalCounterState.listeners.delete(id);
    },
  };
}

interface UseProgramReturn {
  program: ReturnType<typeof createProgramApi>;
  counterAddress: { toBase58: () => string };
  publicKey: { toBase58: () => string } | null;
  connected: boolean;
  connection: ReturnType<typeof createConnectionApi>;
}

export function useProgram(): UseProgramReturn {
  const { status, address } = useWallet();

  return {
    program: createProgramApi(),
    counterAddress: { toBase58: () => "TRADEHAX_COUNTER" },
    publicKey: address ? { toBase58: () => address } : null,
    connected: status === "CONNECTED",
    connection: createConnectionApi(),
  };
}
