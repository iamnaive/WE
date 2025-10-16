"use client";

// src/app/page.tsx
// Minimal Next.js App Router page with explicit wallet picker.
// - No auto-connect, user must choose a wallet
// - Shows address/chain status
// - Provides a "Switch to Monad Testnet" button when needed
// - Keep UI simple; plug your mint/game components below once connection works

import React, { useMemo } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { MONAD_TESTNET } from "./providers";
import ConnectRow from "./ConnectRow";

export default function Page() {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const onMonad = chainId === MONAD_TESTNET.id;

  const title = useMemo(() => {
    if (status === "connecting") return "Connecting...";
    if (status === "reconnecting") return "Reconnecting...";
    if (status === "disconnected") return "Connect a wallet";
    return "Woolly Eggs — Mint & Play (Monad Testnet)";
  }, [status]);

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
          width: "min(920px, 100%)",
          display: "grid",
          gap: 16,
          padding: 20,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{title}</h1>

        {/* Wallet connect row */}
        <ConnectRow />

        {/* Chain helper */}
        {isConnected && !onMonad && (
          <div
            style={{
              display: "grid",
              gap: 8,
              padding: 12,
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Wrong network detected
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              You are on chain ID {chainId}. This app targets Monad Testnet (ID{" "}
              {MONAD_TESTNET.id}).
            </div>
            <div>
              <button
                onClick={() => switchChain({ chainId: MONAD_TESTNET.id })}
                disabled={isSwitching}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #6b46ff",
                  background: "#6b46ff",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {isSwitching ? "Switching…" : "Switch to Monad Testnet"}
              </button>
            </div>
          </div>
        )}

        {/* Status block */}
        <div
          style={{
            display: "grid",
            gap: 8,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ fontWeight: 600 }}>Status</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Connected: {isConnected ? "Yes" : "No"}
          </div>
          <div style={{ fontSize: 13, wordBreak: "break-all", opacity: 0.9 }}>
            Address: {address ?? "—"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Chain ID: {String(chainId ?? "—")}
          </div>
        </div>

        {/* Place your mint/game UI below when connection selection works as expected */}
        {/* Example:
            {isConnected && onMonad && <YourMintComponent />}
        */}
      </section>
    </main>
  );
}
