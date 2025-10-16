"use client";

// src/app/providers.tsx
// Wagmi v2 config without auto-connect.
// - No forced MetaMask popup
// - Session-only storage (no sticky reconnect)
// - WalletConnect added ONLY if you set NEXT_PUBLIC_WC_PROJECT_ID
// - English-only comments

import React from "react";
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/** ===== Chain ===== */
export const MONAD_TESTNET = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 10143),
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet.monadexplorer.com" },
  },
});

/** ===== Connectors =====
 * We do NOT call connect() on mount anywhere -> no auto-connect.
 * Injected: MetaMask/Rabby/Browser wallet if present.
 * WalletConnect: only if you set NEXT_PUBLIC_WC_PROJECT_ID (otherwise hidden).
 * Coinbase Wallet: supported via extension/app.
 */
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

const connectors = [
  injected({
    shimDisconnect: true,
  }),
  coinbaseWallet({
    appName: "Woolly Eggs",
  }),
  // Add WalletConnect ONLY when project id is present
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
        }),
      ]
    : []),
];

/** ===== Config ===== */
export const config = createConfig({
  chains: [MONAD_TESTNET],
  transports: {
    [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!),
  },
  connectors,
  storage: createStorage({
    // Session-only so a refresh won't silently reconnect
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  }),
  // Discover multiple injected providers (MetaMask, Rabby, etc.)
  multiInjectedProviderDiscovery: true,
  // No autoConnect flag in wagmi v2; we intentionally avoid eager reconnects.
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
