"use client";

// src/app/providers.tsx
// Wagmi v2 config (no auto-connect). Session storage. Desktop targets + WalletConnect.
// Comments: English only.

import React from "react";
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const MONAD_TESTNET = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 10143),
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"] } },
  blockExplorers: { default: { name: "Explorer", url: "https://testnet.monadexplorer.com" } },
});

const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

const connectors = [
  // Desktop injected targets
  injected({ shimDisconnect: true, target: "metaMask" }),
  injected({ shimDisconnect: true, target: "phantom" }),
  injected({ shimDisconnect: true, target: "backpack" }),
  injected({ shimDisconnect: true, target: "rabby" }),
  // Mobile / QR
  ...(wcProjectId ? [walletConnect({ projectId: wcProjectId, showQrModal: true })] : []),
];

export const config = createConfig({
  chains: [MONAD_TESTNET],
  transports: { [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!) },
  connectors,
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  }),
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
