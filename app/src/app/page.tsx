"use client";

import React, { useMemo } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract } from "wagmi";

// Comments: English only.

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`;
const TOKEN_ID = BigInt(process.env.NEXT_PUBLIC_TOKEN_ID || "0");

const ABI = [
  "function PRICE() view returns (uint256)",
  "function MAX_PER_WALLET() view returns (uint256)",
  "function remainingFor(address user, uint256 id) view returns (uint256)",
  "function totalSupply(uint256) view returns (uint256)",
  "function uri(uint256) view returns (string)",
  "function mint(uint256 id, uint256 amount) payable",
  "function minted(uint256 id, address user) view returns (uint256)"
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending } = useWriteContract();

  const { data: priceWei } = useReadContract({ address: CONTRACT, abi: ABI as any, functionName: "PRICE" });
  const { data: cap } = useReadContract({ address: CONTRACT, abi: ABI as any, functionName: "MAX_PER_WALLET" });
  const { data: totalMinted } = useReadContract({
    address: CONTRACT, abi: ABI as any, functionName: "totalSupply", args: [TOKEN_ID]
  });
  const { data: left } = useReadContract({
    address: CONTRACT, abi: ABI as any, functionName: "remainingFor",
    args: [address ?? "0x0000000000000000000000000000000000000000", TOKEN_ID]
  });

  const priceMon = useMemo(() => {
    if (!priceWei) return "…";
    const s = BigInt(priceWei as any).toString().padStart(19, "0");
    const whole = s.slice(0, -18);
    const frac = s.slice(-18).replace(/0+$/, "");
    return frac ? `${whole}.${frac}` : whole;
  }, [priceWei]);

  const canMint1 = Number(left ?? 0n) >= 1;
  const canMint2 = Number(left ?? 0n) >= 2;

  const onMint = async (amount: 1 | 2) => {
    await writeContract({
      address: CONTRACT,
      abi: ABI as any,
      functionName: "mint",
      args: [TOKEN_ID, BigInt(amount)],
      value: (priceWei as bigint) * BigInt(amount)
    });
  };

  const onConnect = () => {
    const wc = connectors[0]; // WalletConnect connector
    connect({ connector: wc });
  };

  return (
    <main style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:24,maxWidth:1080,margin:"40px auto",padding:"0 16px"}}>
      {/* Left: media */}
      <section style={{border:"1px solid #333",borderRadius:12,padding:16}}>
        <video src="/video.mp4" poster="/poster.jpg" style={{width:"100%",borderRadius:12}} controls loop muted />
      </section>

      {/* Right: panel */}
      <section style={{display:"flex",flexDirection:"column",gap:16}}>
        <h1 style={{margin:0}}>Woolly Eggs 1155 — Mint</h1>
        <div style={{fontSize:14,opacity:0.8}}>Contract: {CONTRACT}</div>

        <div style={{padding:"12px 14px",border:"1px solid #333",borderRadius:10,display:"grid",gap:8}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Price per NFT:</span><b>{priceMon} MON</b></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Cap per wallet:</span><b>{String(cap ?? 2n)}</b></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Total minted:</span><b>{totalMinted?.toString?.() ?? "0"}</b></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Your remaining:</span><b>{left?.toString?.() ?? (isConnected ? "0" : "—")}</b></div>
        </div>

        {!isConnected ? (
          <button onClick={onConnect}>
            {connectStatus === "pending" ? "Connecting..." : "Connect (WalletConnect)"}
          </button>
        ) : (
          <>
            <div style={{display:"flex",gap:12}}>
              <button onClick={() => onMint(1)} disabled={isPending || !canMint1}>
                {isPending ? "Minting..." : "Mint 1"}
              </button>
              <button onClick={() => onMint(2)} disabled={isPending || !canMint2}>
                {isPending ? "Minting..." : "Mint 2"}
              </button>
            </div>
            <button onClick={() => disconnect()} style={{background:"transparent"}}>Disconnect</button>
          </>
        )}

        <div style={{fontSize:12,opacity:0.7,marginTop:12}}>
          You are {address || "not connected"}.
        </div>
      </section>
    </main>
  );
}
