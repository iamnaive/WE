"use client";

// src/app/WalletButtons.tsx
// Two-button UX:
//  1) "WalletConnect (Mobile / QR)"
//  2) "Browser Wallet" -> opens a mini modal with MetaMask / Phantom / Backpack / Rabby
// No auto-connect. English-only comments.

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { MONAD_TESTNET } from "./providers";

type Opt = {
  id: string;
  label: string;
  // wagmi connector id or uid will be matched by label
};

export default function WalletButtons() {
  const { connectors, connect, status, error } = useConnect(); // "idle" | "pending" | "success" | "error"
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const chainId = useChainId();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => setMounted(true), []);

  const browserOptions: Opt[] = useMemo(
    () => [
      { id: "metaMask", label: "MetaMask" },
      { id: "phantom", label: "Phantom" },
      { id: "backpack", label: "Backpack" },
      { id: "rabby", label: "Rabby" },
    ],
    []
  );

  // Map wagmi connectors by known name
  const byName = useMemo(() => {
    const m = new Map<string, (typeof connectors)[number]>();
    for (const c of connectors) {
      // c.name for injected targets usually equals "MetaMask", "Phantom", "Backpack", "Rabby"
      m.set(c.name.toLowerCase(), c);
    }
    return m;
  }, [connectors]);

  // WalletConnect connector (if configured)
  const wcConnector = useMemo(
    () => connectors.find((c: any) => c.type === "walletConnect"),
    [connectors]
  );

  if (!mounted) {
    return <div style={{ opacity: 0.6 }}>Loading…</div>;
  }

  if (address) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Connected</div>
        <div style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>{address}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Chain: {chainId} {chainId !== MONAD_TESTNET.id ? "(switch may be needed)" : ""}
        </div>
        <button
          onClick={() => disconnect()}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #444",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Disconnect / Change wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* 1) Mobile / QR */}
      {wcConnector && (
        <button
          onClick={() => connect({ connector: wcConnector })}
          disabled={status === "pending"}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #6b46ff",
            background: "#6b46ff",
            color: "white",
            fontWeight: 700,
            cursor: status === "pending" ? "not-allowed" : "pointer",
          }}
        >
          {status === "pending" ? "Opening WalletConnect…" : "WalletConnect (Mobile / QR)"}
        </button>
      )}

      {/* 2) Browser Wallet */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #444",
          background: "transparent",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Browser Wallet (MetaMask / Phantom / Backpack / Rabby)
      </button>

      {/* Mini modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
          onClick={() => setShowModal(false)
