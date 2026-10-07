"use client";

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChallenge, PLATFORM_FEE_RATE } from '../lib/challenges';
import { GAME_LABELS, type GameType } from '../lib/types';

export function CreateChallengeForm({ address }: { address: string }) {
  const queryClient = useQueryClient();
  const [gameType, setGameType] = useState<GameType>('rock_paper_scissors');
  const [stake, setStake] = useState('10');

  const stakeValue = Number(stake);
  const isValid = Number.isFinite(stakeValue) && stakeValue > 0 && stakeValue <= 10000;
  const pot = isValid ? stakeValue * 2 : 0;

  const mutation = useMutation({
    mutationFn: () => createChallenge({ creator: address, gameType, stake: stakeValue }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] }),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) mutation.mutate();
  };

  return (
    <section aria-labelledby="create-heading" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 id="create-heading" className="mb-4 text-lg font-semibold">Create a challenge</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="game" className="text-sm text-zinc-400">Game</label>
          <select
            id="game"
            value={gameType}
            onChange={(e) => setGameType(e.target.value as GameType)}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
          >
            {Object.entries(GAME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:w-36">
          <label htmlFor="stake" className="text-sm text-zinc-400">Stake (USDC)</label>
          <input
            id="stake"
            type="number"
            min="1"
            max="10000"
            step="1"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={!isValid || mutation.isPending}
          className="rounded-md bg-emerald-600 px-5 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {mutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
      <p className="mt-3 text-xs text-zinc-500">
        {isValid
          ? `Pot ${pot} USDC • winner receives ${(pot * (1 - PLATFORM_FEE_RATE)).toFixed(2)} USDC after ${PLATFORM_FEE_RATE * 100}% fee`
          : 'Enter a stake between 1 and 10,000 USDC.'}
      </p>
      {mutation.error && <p role="alert" className="mt-2 text-sm text-red-400">{mutation.error.message}</p>}
    </section>
  );
}
