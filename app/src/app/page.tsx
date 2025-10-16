"use client";

// src/app/page.tsx
// Two-column layout: video left, right panel with ultra-minimal UI:
// Title "WOOL", wallet buttons, MINT button (visible when connected & on correct chain).

import React, { useMemo } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { MONAD_TESTNET } from "./providers";
import WalletButtons from "./WalletButtons";

export default function Page() {
  const { address, isConnected, status } = useAccount(); // "connected" | "connecting" | "reconnecting" | "disconnected"
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // Wire your mint below
  const { writeContract, isPending: isMinting } = useWriteContract();

  const onMonad = chainId === MONAD_TESTNET.id;

  const title = useMemo(() => "WOOL", []);

  const handleMint = () => {
    // TODO: replace with your real contract address + ABI + function + args
    // Example for ERC-1155:
    // writeContract({
    //   abi: WE1155_ABI,
    //   address: "0xYour1155Address",
    //   functionName: "mint",
    //   args: [address, 1, 1, "0x"],
    //   // value: parseEther("0") // if payable
    // });
    console.log("Mint clicked");
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

        {/* 2-column */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* LEFT: video */}
          <div
            style={{
              overflow: "hidden",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 260,
            }}
          >
            <video
              src="/video.mp4"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              playsInline
              muted
              autoPlay
              loop
              controls
            />
          </div>

          {/* RIGHT: minimal controls */}
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <WalletButtons />

            {/* If connected but wrong chain: show switch */}
            {isConnected && !onMonad && (
              <button
                onClick={() => switchChain({ chainId: MONAD_TESTNET.id })}
                disabled={isSwitching}
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
                {isSwitching ? "Switching…" : "Switch to Monad"}
              </button>
            )}

            {/* MINT: visible when connected on correct chain */}
            {isConnected && onMonad && (
              <button
                onClick={handleMint}
                disabled={isMinting}
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
                {isMinting ? "Minting…" : "MINT"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Mobile stacking */}
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
