"use client";

import { useAccount } from 'wagmi';
import { SiteHeader } from '../components/site-header';
import { CreateChallengeForm } from '../components/create-challenge-form';
import { ChallengeList } from '../components/challenge-list';
import { isSupabaseConfigured } from '../lib/supabase';
import { PLATFORM_FEE_RATE } from '../lib/challenges';

export default function RefGame() {
  const { address, isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-50 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <SiteHeader />

        {!isSupabaseConfigured && (
          <p role="alert" className="rounded-md border border-amber-900/60 bg-amber-950/40 p-3 text-sm text-amber-200">
            Supabase environment variables are missing, so challenges cannot be loaded or saved.
          </p>
        )}

        {isConnected && address ? (
          <>
            <CreateChallengeForm address={address} />
            <ChallengeList address={address} />
          </>
        ) : (
          <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-balance">Wager USDC on head-to-head games</h2>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 text-pretty">
              Connect a wallet on Base Sepolia to create or accept challenges. The referee settles each match and the
              winner takes the pot minus a {PLATFORM_FEE_RATE * 100}% platform fee.
            </p>
          </section>
        )}

        <footer className="text-center text-xs text-zinc-500">
          Testnet only • Base Sepolia • Platform fee {PLATFORM_FEE_RATE * 100}% per payout
        </footer>
      </div>
    </main>
  );
}
