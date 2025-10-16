"use client";

import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Monad Testnet
const MONAD_TESTNET = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 10143),
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"] },
    public:  { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"] }
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet.monadexplorer.com" }
  }
});

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

const config = createConfig({
  chains: [MONAD_TESTNET],
  connectors: [
    // Официальные targets у injected
    injected({ target: "metaMask", shimDisconnect: true }),
    injected({ target: "rabby", shimDisconnect: true }),
    injected({ target: "okxWallet", shimDisconnect: true }),
    injected({ target: "bitKeep", shimDisconnect: true }), // Bitget
    injected({ target: "coinbaseWallet", shimDisconnect: true }),
    injected({ target: "phantom", shimDisconnect: true }),
    // Универсальный injected на случай других EVM-расширений
    injected({ shimDisconnect: true }),

    // WalletConnect
    walletConnect({
      projectId: WC_PROJECT_ID,
      showQrModal: true,
    }),
  ],
  transports: {
    [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!)
  }
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
