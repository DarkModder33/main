"use client";

import { FC, ReactNode } from "react";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  return <>{children}</>;
};
