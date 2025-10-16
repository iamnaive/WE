"use client";

// src/app/ConnectRow.tsx
// Explicit wallet picker UI — never auto-connects.
// Fixes "unavailable" on SSR by delaying rendering until mounted.
// WalletConnect button appears only if connector exists (wc project id set).
// English-only comments.

import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { MONAD_TESTNET } from "./providers";

export default function ConnectRow() {
  const { connectors, connect, status, error } = useConnect(); // "idle" | "pending" | "success" | "error"
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const chainId = useChainId();

  // Avoid SSR "unavailable" state by rendering only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ opacity: 0.6, fontSize: 14 }}>
        Loading wallet list…
      </div>
    );
  }

  if (address) {
    return (
      <div style={{ display: "grid", gap: 8, alignItems: "start" }}>
        <div style={{ fontWeight: 600 }}>Connected</div>
        <div style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>
          {address}
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Chain: {chainId} {chainId !== MONAD_TESTNET.id ? "(switch may be needed)" : ""}
        </div>
        <button
          onClick={() => disconnect()}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
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
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Choose a wallet</div>
      {connectors.map((c) => {
        // WalletConnect is usable without an extension; others require readiness
        const isWalletConnect = (c as any).type === "walletConnect";
        const disabled = (!isWalletConnect && !c.ready) || status === "pending";

        return (
          <button
            key={(c as any).uid ?? c.id}
            onClick={() => connect({ connector: c })}
            disabled={disabled}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "transparent",
              textAlign: "left",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
            }}
            title={c.name}
          >
            {c.name} {!isWalletConnect && !c.ready ? " (unavailable)" : ""}
          </button>
        );
      })}
      <div style={{ fontSize: 12, opacity: 0.7, minHeight: 18 }}>
        {status === "pending" ? "Opening your wallet..." : ""}
        {error ? `Error: ${error.message}` : ""}
      </div>
    </div>
  );
}
