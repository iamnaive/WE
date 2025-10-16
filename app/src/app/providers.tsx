"use client";

// src/app/providers.tsx
// Wagmi v2 provider config with NO auto-connect.
// - No implicit MetaMask popups
// - Session-only storage (no sticky reconnect)
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
 * Do NOT call connect() on mount anywhere -> no auto-connect.
 * We omit `target` so injected providers are discovered without forcing MetaMask.
 */
const connectors = [
  injected({
    shimDisconnect: true,
  }),
  walletConnect({
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
    // Keep options minimal for type-compatibility; WC modal opens automatically when needed.
  }),
  coinbaseWallet({
    appName: "Woolly Eggs",
    // Keep defaults; extension/app preference chosen by SDK.
  }),
];

/** ===== Config ===== */
export const config = createConfig({
  chains: [MONAD_TESTNET],
  transports: {
    [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!),
  },
  connectors,
  storage: createStorage({
    // Session-only so a page refresh doesn't auto-reconnect unexpectedly
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  }),
  // Discover multiple injected providers (MetaMask, Rabby, etc.) without picking one automatically.
  multiInjectedProviderDiscovery: true,
  // NOTE: Do NOT add autoConnect (removed in wagmi v2); we avoid eager reconnects by design.
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
