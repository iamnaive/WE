"use client";

// src/app/page.tsx
// Two-column layout. Minimal UI: title "WOOL", wallet buttons, ERC-1155 MINT.
// Uses your contract: mint(uint256 id, uint256 amount) payable (3 MON).

import React, { useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { MONAD_TESTNET } from "./providers";

const ERC1155_ADDRESS = "0xD49c2012f5DEe5d82116949ca6168584E441A5DC" as const;

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

import WalletButtons from "./WalletButtons";

export default function Page() {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync, isPending: minting } = useWriteContract();

  const [txError, setTxError] = useState<string | null>(null);
  const [txSent, setTxSent] = useState<string | null>(null);

  const onMonad = chainId === MONAD_TESTNET.id;
  const title = useMemo(() => "WOOL", []);

  const onMint = async () => {
    if (!isConnected || !address) { setTxError("Connect a wallet"); return; }
    if (!onMonad) { setTxError("Switch to Monad Testnet"); return; }
    setTxError(null);
    setTxSent(null);
    try {
      const hash = await writeContractAsync({
        abi: ABI_MINT,
        address: ERC1155_ADDRESS,
        functionName: "mint",
        args: [TOKEN_ID, AMOUNT],
        value: PRICE_PER_UNIT * AMOUNT,
      });
      setTxSent(hash as any);
    } catch (e: any) {
      setTxError(e?.message || String(e));
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

            {isConnected && !onMonad && (
              <button
                onClick={() => switchChain({ chainId: MONAD_TESTNET.id })}
                disabled={switching}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #6b46ff",
                  background: "#6b46ff",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {switching ? "Switching…" : "Switch to Monad"}
              </button>
            )}

            {isConnected && onMonad && (
              <>
                <button
                  onClick={onMint}
                  disabled={minting}
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
                  {minting ? "Minting…" : "MINT"}
                </button>
                <div style={{ minHeight: 16, fontSize: 12 }}>
                  {txError ? <span style={{ color: "#ff8080" }}>{txError}</span> : null}
                  {txSent ? <span>Tx: {txSent}</span> : null}
                </div>
              </>
            )}
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
