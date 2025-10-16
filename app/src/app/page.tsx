"use client";

// src/app/page.tsx
// Minimal WOOL: видео слева, справа кошельки + MINT.
// Force network to Monad Testnet via wallet_switchEthereumChain / wallet_addEthereumChain.

import React, { useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { MONAD_TESTNET } from "./providers";
import type { Address } from "viem";
import WalletButtons from "./WalletButtons";

const ERC1155_ADDRESS = "0xD49c2012f5DEe5d82116949ca6168584E441A5DC" as Address;

// mint(uint256 id, uint256 amount) payable (3 MON)
const ABI_MINT = [
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

const TOKEN_ID = 1n;
const AMOUNT = 1n;
const PRICE_PER_UNIT = 3_000_000_000_000_000_000n; // 3 MON

// Hex chain id for wallet_* methods
const MONAD_CHAIN_HEX = "0x279f"; // 10143
const MONAD_PARAMS = {
  chainId: MONAD_CHAIN_HEX,
  chainName: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
};

export default function Page() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: switching } = useSwitchChain();
  const { writeContractAsync, isPending: minting } = useWriteContract();

  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const title = useMemo(() => "WOOL", []);
  const onMonad = chainId === MONAD_TESTNET.id;

  // Try wagmi switch first; if wallet ignores it, fall back to raw EIP-1193 calls.
  const ensureMonadNetwork = async () => {
    if (onMonad) return;

    // 1) Normal wagmi switch
    try {
      await switchChainAsync({ chainId: MONAD_TESTNET.id });
      return;
    } catch {
      // ignore — try manual path below
    }

    // 2) Manual: use current connector's provider, else window.ethereum
    const prov =
      (connector && (await connector.getProvider?.())) ||
      (typeof window !== "undefined" ? (window as any).ethereum : undefined);

    if (!prov?.request) {
      throw new Error("Wallet provider not available");
    }

    // try switch; if chain unknown (4902), add it, then switch again
    try {
      await prov.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MONAD_CHAIN_HEX }] });
    } catch (e: any) {
      const code = e?.code ?? e?.data?.originalError?.code;
      if (code === 4902) {
        // add chain then switch
        await prov.request({
          method: "wallet_addEthereumChain",
          params: [MONAD_PARAMS],
        });
        await prov.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MONAD_CHAIN_HEX }] });
      } else {
        throw e;
      }
    }
  };

  const onMint = async () => {
    setTxError(null);
    setTxHash(null);
    if (!isConnected || !address) {
      setTxError("Connect a wallet");
      return;
    }

    try {
      // Force the wallet to Monad Testnet
      await ensureMonadNetwork();

      // Send tx explicitly on Monad chain
      const hash = await writeContractAsync({
        chainId: MONAD_TESTNET.id,
        abi: ABI_MINT,
        address: ERC1155_ADDRESS,
        functionName: "mint",
        args: [TOKEN_ID, AMOUNT],
        value: PRICE_PER_UNIT * AMOUNT,
      });
      setTxHash(hash as string);
    } catch (e: any) {
      // show concise message (phantom/metaMask often include long help text)
      setTxError(e?.shortMessage || e?.message || String(e));
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(80% 60% at 50% 20%, #1c1c28 0%, #0b0b12 60%, #06060b 100%)",
        color: "white",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <section
        style={{
          width: "min(1200px, 100%)",
          display: "grid",
          gap: 18,
          padding: 18,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{title}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
          {/* LEFT: video */}
          <div style={{ overflow: "hidden", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", minHeight: 260 }}>
            <video
              src="/video.mp4"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              playsInline muted autoPlay loop controls
            />
          </div>

          {/* RIGHT: controls */}
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <WalletButtons />

            {isConnected && (
              <button
                onClick={onMint}
                disabled={minting || switching}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #00cf7f",
                  background: "#00cf7f",
                  color: "#08110d",
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                {minting || switching ? "Processing…" : "MINT"}
              </button>
            )}

            <div style={{ minHeight: 16, fontSize: 12 }}>
              {/* small status for clarity */}
              {isConnected ? (
                <span>
                  Connected: {address} • Chain {chainId}
                </span>
              ) : null}
            </div>

            <div style={{ minHeight: 16, fontSize: 12 }}>
              {txError ? <span style={{ color: "#ff8080" }}>{txError}</span> : null}
              {txHash ? <span>Tx: {txHash}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          main section > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
