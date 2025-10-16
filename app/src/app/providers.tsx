"use client";

// src/app/providers.tsx
// Wagmi v2 provider config with NO auto-connect.
// - Uses sessionStorage so it won't "stick" across tabs
// - Exposes Injected, WalletConnect, and Coinbase Wallet without prompting MetaMask
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
 * Avoid eager popups by not calling connect() on mount.
 * Enable discovery so multiple injected providers (MetaMask, Rabby) appear.
 */
const connectors = [
  injected({
    shimDisconnect: true,
    // Show a single "Browser Wallet" entry that aggregates injected providers.
    // If you want separate entries for MetaMask/Rabby, set target: undefined.
    target: "injected",
  }),
  walletConnect({
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
    showQrModal: true,
    metadata: {
      name: "Woolly Eggs",
      description: "Mint & play on Monad Testnet",
      url: "https://example.com",
      icons: ["https://example.com/icon.png"],
    },
  }),
  coinbaseWallet({
    appName: "Woolly Eggs",
    preference: "all", // allow extension or Wallet app
  }),
];

/** ===== Config ===== */
export const config = createConfig({
  chains: [MONAD_TESTNET],
  transports: {
    [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!),
  },
  connectors,
  // Store only for this tab/session so it won't feel "auto-connected"
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  }),
  // Let Wagmi discover multiple injected providers without picking one automatically
  multiInjectedProviderDiscovery: true,
  // NOTE: Do not set autoConnect here (removed in wagmi v2); we intentionally avoid eager reconnects.
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
