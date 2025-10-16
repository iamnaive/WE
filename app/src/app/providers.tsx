"use client";

import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Comments: English only.

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

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!; // required

const config = createConfig({
  chains: [MONAD_TESTNET],
  connectors: [
    walletConnect({
      projectId: WC_PROJECT_ID,
      showQrModal: true
    })
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
