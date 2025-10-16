"use client";

// src/app/WalletButtons.tsx
// Two-button UX:
//  1) "WalletConnect (Mobile / QR)"
//  2) "Browser Wallet" -> mini modal: MetaMask / Phantom / Backpack / Rabby
// We don't auto-connect. Buttons are clickable even if wagmi marks not ready,
// and we surface any connect error. English-only comments.

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { MONAD_TESTNET } from "./providers";

type Opt = {
  id: "metaMask" | "phantom" | "backpack" | "rabby";
  label: string;
};

export default function WalletButtons() {
  const { connectors, connect, status, error, reset } = useConnect(); // "idle" | "pending" | "success" | "error"
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const chainId = useChainId();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastErr, setLastErr] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Basic window-based hints so user sees "installed" correctly
  const hint = useMemo(() => {
    if (!mounted) return { metamask: false, rabby: false, phantom: false, backpack: false };
    const w = window as any;
    const eth = w.ethereum;
    const providers: any[] = Array.isArray(eth?.providers) ? eth.providers : [eth].filter(Boolean);

    const hasFlag = (key: string) => providers.some((p) => p && p[key]);
    const hasMM = hasFlag("isMetaMask");
    const hasRabby = hasFlag("isRabby") || !!w.rabby;
    const hasPhantom = hasFlag("isPhantom") || !!w.phantom?.ethereum;
    const hasBackpack = hasFlag("isBackpack") || !!w.backpack?.ethereum;

    return {
      metamask: !!hasMM,
      rabby: !!hasRabby,
      phantom: !!hasPhantom,
      backpack: !!hasBackpack,
    };
  }, [mounted]);

  const browserOptions: Opt[] = useMemo(
    () => [
      { id: "metaMask", label: "MetaMask" },
      { id: "phantom", label: "Phantom" },
      { id: "backpack", label: "Backpack" },
      { id: "rabby", label: "Rabby" },
    ],
    []
  );

  // Map wagmi connectors by lowercase name
  const byName = useMemo(() => {
    const m = new Map<string, (typeof connectors)[number]>();
    for (const c of connectors) {
      m.set(c.name.toLowerCase(), c);
    }
    return m;
  }, [connectors]);

  // WalletConnect connector (if configured)
  const wcConnector = useMemo(
    () => connectors.find((c: any) => c.type === "walletConnect"),
    [connectors]
  );

  // Pick connector by option id with fuzzy match
  const pickConnector = (opt: Opt) => {
    const mapKeys = Array.from(byName.keys());
    const pick = (needle: string) =>
      byName.get(needle) ||
      byName.get(`${needle} wallet`) ||
      mapKeys.find((k) => k.includes(needle)) && byName.get(mapKeys.find((k) => k.includes(needle))!);

    if (opt.id === "metaMask") return pick("metamask");
    if (opt.id === "phantom") return pick("phantom");
    if (opt.id === "backpack") return pick("backpack");
    if (opt.id === "rabby") return pick("rabby");
    return undefined;
  };

  const tryConnect = async (opt: Opt) => {
    setLastErr(null);
    const c = pickConnector(opt);
    if (!c) {
      setLastErr(`${opt.label}: connector not found`);
      return;
    }
    try {
      await connect({ connector: c });
    } catch (e: any) {
      setLastErr(e?.message || String(e));
      // allow another attempt without stale state
      reset();
    }
  };

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
      {/* 1) Mobile / QR — WalletConnect */}
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
          {status === "pending" ? "Opening WalletConnect…" : "WalletConnect (Mobile / QR)"}
        </button>
      )}

      {/* 2) Browser Wallet — modal with desktop options */}
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: "min(460px, 92vw)",
              display: "grid",
              gap: 10,
              padding: 16,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(16,16,24,0.98)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Choose a browser wallet
            </div>

            {browserOptions.map((opt) => {
              const installed =
                (opt.id === "metaMask" && hint.metamask) ||
                (opt.id === "phantom" && hint.phantom) ||
                (opt.id === "backpack" && hint.backpack) ||
                (opt.id === "rabby" && hint.rabby);

              return (
                <button
                  key={opt.id}
                  onClick={() => tryConnect(opt)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #333",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {opt.label} {installed ? " (installed)" : " (click to try)"}
                </button>
              );
            })}

            <div style={{ fontSize: 12, opacity: 0.85, minHeight: 18 }}>
              {status === "pending" ? "Opening your wallet…" : ""}
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
