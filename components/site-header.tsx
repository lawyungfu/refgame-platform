"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Swords, Wallet } from 'lucide-react';
import { shortAddress } from '../lib/challenges';

export function SiteHeader() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <Swords className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">RefGame</h1>
          <p className="text-sm text-zinc-400">P2P escrow gaming on Base Sepolia</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1 sm:items-end">
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-300">{shortAddress(address)}</span>
            <button
              onClick={() => disconnect()}
              className="rounded-md border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
          >
            <Wallet className="size-4" aria-hidden="true" />
            {isPending ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
        {error && <p className="text-xs text-red-400">{error.message.split('\n')[0]}</p>}
      </div>
    </header>
  );
}
