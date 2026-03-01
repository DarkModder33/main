"use client";

import { FC, ReactNode } from "react";

interface ChainSessionProviderProps {
  children: ReactNode;
}

/**
 * Chain-agnostic session provider shell.
 *
 * This is intentionally minimal while the signing/session stack is being
 * migrated to a fully chain-neutral connector.
 */
export const ChainSessionProvider: FC<ChainSessionProviderProps> = ({ children }) => (
  <>{children}</>
);
