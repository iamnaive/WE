"use client";

// src/app/WalletButtons.tsx
// Two-button UX:
//  1) WalletConnect (Mobile / QR)
//  2) Browser Wallet -> mini modal with MetaMask / Phantom / Backpack / Rabby
// Modal buttons: purple (ready) vs grey (not ready). No extra labels.
// English-only comments.

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { MONAD_TESTNET } from "./providers";
import type { Connector } from "wagmi";

type Opt = "metaMask" | "phantom" | "backpack" | "rabby";

export default function WalletButtons() {
  const { connectors, connect, status, error, reset } = useConnect(); // "idle" | "pending" | "success" | "error"
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const chainId = useChainId();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastErr, setLastErr] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const order: { id: Opt; match: string; label: string }[] = useMemo(
    () => [
      { id: "metaMask", match: "metamask", label: "MetaMask" },
      { id: "phantom",  match: "phantom",  label: "Phantom"  },
      { id: "backpack", match: "backpack", label: "Backpack" },
      { id: "rabby",    match: "rabby",    label: "Rabby"    },
    ],
    []
  );

  // Find a connector strictly by name substring (lowercased)
  const pick = (id: Opt): Connector | undefined => {
    const m = order.find(o => o.id === id)!.match;
    const target = connectors.find(c => c.name.toLowerCase().includes(m));
    return target;
  };

  const wcConnector = useMemo(
    () => connectors.find((c: any) => c.type === "walletConnect"),
    [connectors]
  );

  const tryConnect = async (id: Opt) => {
    setLastErr(null);
    const c = pick(id);
    if (!c) {
      setLastErr("Connector not found");
      return;
    }
    try {
      await connect({ connector: c });
    } catch (e: any) {
      setLastErr(e?.message || String(e));
      reset();
    }
  };

  if (!mounted) return <div style={{ opacity: 0.6 }}>Loading…</div>;

  if (address) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {address} • Chain {chainId} {chainId !== MONAD_TESTNET.id ? "(switch needed)" : ""}
        </div>
        <button
          onClick={() => disconnect()}
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
          Disconnect / Change wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* 1) WalletConnect */}
      {wcConnector && (
        <button
          onClick={() => connect({ connector: wcConnector })}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #6b46ff",
            background: "#6b46ff",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {status === "pending" ? "Opening…" : "WalletConnect"}
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
        Browser Wallet
      </button>

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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: "min(420px, 92vw)",
              display: "grid",
              gap: 10,
              padding: 16,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(16,16,24,0.98)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>Choose</div>

            {order.map(({ id, label, match }) => {
              const c = pick(id);
              const ready = Boolean(c?.ready);
              const disabled = !ready || status === "pending";
              return (
                <button
                  key={id}
                  onClick={() => tryConnect(id)}
                  disabled={disabled}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    border: ready ? "1px solid #6b46ff" : "1px solid #333",
                    background: ready ? "rgba(107,70,255,0.12)" : "transparent",
                    color: "white",
                    textAlign: "left",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.55 : 1,
                    fontWeight: 600,
                  }}
                  title={label}
                  aria-label={match}
                >
                  {label}
                </button>
              );
            })}

            <div style={{ fontSize: 12, opacity: 0.85, minHeight: 18 }}>
              {error ? `Error: ${error.message}` : ""}
              {lastErr ? `Error: ${lastErr}` : ""}
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 2,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #444",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
