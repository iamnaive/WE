"use client";

// src/app/providers.tsx
// Wagmi v2 config without auto-connect.
// - WalletConnect (QR) для мобилок
// - Отдельные injected-коннекторы под MetaMask / Phantom / Backpack / Rabby
// - Session storage, чтобы не прилипало между вкладками
// - Комментарии только на английском

import React from "react";
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
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
 * We provide specific injected targets to let user choose on desktop:
 *  - metaMask / phantom / backpack / rabby
 * For mobile: WalletConnect (QR modal).
 */
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

const injectedMetaMask = injected({ shimDisconnect: true, target: "metaMask" });
const injectedPhantom  = injected({ shimDisconnect: true, target: "phantom" });
const injectedBackpack = injected({ shimDisconnect: true, target: "backpack" });
const injectedRabby    = injected({ shimDisconnect: true, target: "rabby" });

const connectors = [
  // Desktop choices (shown in our modal)
  injectedMetaMask,
  injectedPhantom,
  injectedBackpack,
  injectedRabby,

  // Mobile/QR (explicit button)
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [MONAD_TESTNET],
  transports: {
    [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!),
  },
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
