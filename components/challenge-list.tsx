"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import {
  acceptChallenge,
  fetchChallenges,
  PLATFORM_FEE_RATE,
  settleChallenge,
  shortAddress,
} from '../lib/challenges';
import { GAME_LABELS, type Challenge } from '../lib/types';

const STATUS_STYLES: Record<Challenge['status'], string> = {
  open: 'bg-sky-500/15 text-sky-300',
  active: 'bg-amber-500/15 text-amber-300',
  settled: 'bg-emerald-500/15 text-emerald-300',
};

export function ChallengeList({ address }: { address: string }) {
  const queryClient = useQueryClient();
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['challenges', address],
    queryFn: () => fetchChallenges(address),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['challenges'] });

  const accept = useMutation({
    mutationFn: (c: Challenge) => acceptChallenge(c.id, address),
    onSuccess: invalidate,
  });

  const settle = useMutation({
    mutationFn: (c: Challenge) => settleChallenge(c),
    onSuccess: invalidate,
  });

  const busy = accept.isPending || settle.isPending;
  const actionError = accept.error ?? settle.error;

  return (
    <section aria-labelledby="list-heading" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="list-heading" className="text-lg font-semibold">Challenges</h2>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading challenges...</p>}
      {error && (
        <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          Could not load challenges: {error.message}
        </p>
      )}
      {actionError && <p role="alert" className="mb-3 text-sm text-red-400">{actionError.message}</p>}

      {data && data.length === 0 && <p className="text-sm text-zinc-500">No challenges yet. Create one above.</p>}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((c) => {
            const isParticipant = c.creator_address === address || c.opponent_address === address;
            const payout = c.stake_amount * 2 * (1 - PLATFORM_FEE_RATE);
            return (
              <li
                key={c.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{GAME_LABELS[c.game_type] ?? c.game_type}</span>
                    <span className={`rounded px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    <span className="font-mono">{shortAddress(c.creator_address)}</span>
                    {c.opponent_address && (
                      <>
                        {' vs '}
                        <span className="font-mono">{shortAddress(c.opponent_address)}</span>
                      </>
                    )}
                    {' • '}
                    <span className="font-semibold text-zinc-200">{c.stake_amount} USDC</span> stake
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {c.status === 'open' && c.creator_address !== address && (
                    <button
                      onClick={() => accept.mutate(c)}
                      disabled={busy}
                      className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
                    >
                      Accept
                    </button>
                  )}
                  {c.status === 'open' && c.creator_address === address && (
                    <span className="text-sm text-zinc-500">Waiting for opponent</span>
                  )}
                  {c.status === 'active' && isParticipant && (
                    <button
                      onClick={() => settle.mutate(c)}
                      disabled={busy}
                      className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Settle (Referee)
                    </button>
                  )}
                  {c.status === 'settled' && (
                    <span className="text-sm text-emerald-400">
                      {c.winner_address === address ? 'You won' : `Winner ${shortAddress(c.winner_address)}`} • {payout.toFixed(2)} USDC
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
