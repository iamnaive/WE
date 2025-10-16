"use client";

// src/app/ConnectRow.tsx
// Explicit wallet picker UI — never auto-connects.
// Render this where you want the "Choose a wallet" row.
// English-only comments.

import React from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { MONAD_TESTNET } from "./providers";

export default function ConnectRow() {
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const chainId = useChainId();

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
      {connectors.map((c) => (
        <button
          key={c.uid}
          onClick={() => connect({ connector: c })}
          disabled={!c.ready || status === "connecting"}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #444",
            background: "transparent",
            textAlign: "left",
            cursor: c.ready ? "pointer" : "not-allowed",
            opacity: c.ready ? 1 : 0.5,
          }}
          title={c.name}
        >
          {c.name} {!c.ready ? "(unavailable)" : ""}
        </button>
      ))}
      <div style={{ fontSize: 12, opacity: 0.7, minHeight: 18 }}>
        {status === "connecting" ? "Opening your wallet..." : ""}
        {error ? `Error: ${error.message}` : ""}
      </div>
    </div>
  );
}
