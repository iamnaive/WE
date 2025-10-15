"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, http, WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { PrivyWagmiConnector } from "@privy-io/wagmi";

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

const wagmiConfig = createConfig({
  chains: [MONAD_TESTNET],
  transports: { [MONAD_TESTNET.id]: http((MONAD_TESTNET.rpcUrls.default?.http || [])[0]!) }
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "wallet", "google", "twitter"],
        embeddedWallets: { createOnLogin: "users-without-wallets" }
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <PrivyWagmiConnector wagmiChains={[MONAD_TESTNET]}>
          {children}
        </PrivyWagmiConnector>
      </WagmiProvider>
    </PrivyProvider>
  );
}
