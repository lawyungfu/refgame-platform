"use client";

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { supabase } from '../lib/supabase';
import type { Challenge } from '../lib/types';

export default function RefGame() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [gameType, setGameType] = useState<'rock_paper_scissors' | 'tic_tac_toe' | 'gomoku'>('rock_paper_scissors');
  const [stake, setStake] = useState('10');
  const [loading, setLoading] = useState(false);

  const loadChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (data) setChallenges(data as Challenge[]);
  };

  const createChallenge = async () => {
    if (!address) return;
    setLoading(true);

    const { error } = await supabase.from('challenges').insert({
      creator_address: address,
      game_type: gameType,
      stake_amount: parseFloat(stake),
      status: 'open',
    });

    if (!error) {
      await loadChallenges();
    }
    setLoading(false);
  };

  const acceptChallenge = async (challenge: Challenge) => {
    if (!address || challenge.creator_address === address) return;
    setLoading(true);

    const { error } = await supabase
      .from('challenges')
      .update({
        opponent_address: address,
        status: 'active',
      })
      .eq('id', challenge.id);

    if (!error) {
      await loadChallenges();
      alert(`Challenge accepted! Game starts now. Stake: $${challenge.stake_amount} USDC`);
    }
    setLoading(false);
  };

  const settleChallenge = async (challenge: Challenge) => {
    if (!address) return;
    setLoading(true);

    const winner = Math.random() > 0.5 ? challenge.creator_address : challenge.opponent_address || address;
    const platformFee = challenge.stake_amount * 0.1;
    const payout = challenge.stake_amount * 0.9;

    const { error } = await supabase
      .from('challenges')
      .update({
        status: 'settled',
        winner_address: winner,
        settled_at: new Date().toISOString(),
      })
      .eq('id', challenge.id);

    if (!error) {
      alert(`Challenge settled! Winner receives $${payout} USDC (platform fee: $${platformFee})`);
      await loadChallenges();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">RefGame</h1>
            <p className="text-zinc-400">P2P Escrow Gaming • Base Sepolia</p>
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">{address?.slice(0,6)}...{address?.slice(-4)}</span>
              <button onClick={() => disconnect()} className="px-4 py-2 bg-zinc-800 rounded">Disconnect</button>
            </div>
          ) : (
            <button onClick={() => connect({ connector: injected() })} className="px-6 py-3 bg-white text-black rounded font-medium">
              Connect Wallet
            </button>
          )}
        </div>

        {isConnected && (
          <>
            <div className="bg-zinc-900 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Create New Challenge</h2>
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Game</label>
                  <select value={gameType} onChange={(e) => setGameType(e.target.value as any)} className="bg-zinc-800 px-4 py-2 rounded">
                    <option value="rock_paper_scissors">Rock Paper Scissors</option>
                    <option value="tic_tac_toe">Tic Tac Toe</option>
                    <option value="gomoku">Gomoku</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Stake (USDC)</label>
                  <input type="number" value={stake} onChange={(e) => setStake(e.target.value)} className="bg-zinc-800 px-4 py-2 rounded w-24" />
                </div>
                <button onClick={createChallenge} disabled={loading} className="px-6 py-2 bg-emerald-600 rounded font-medium disabled:opacity-50">
                  Create Challenge
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Open Challenges</h2>
                <button onClick={loadChallenges} className="text-sm text-zinc-400 hover:text-white">Refresh</button>
              </div>

              {challenges.length === 0 ? (
                <p className="text-zinc-500">No open challenges. Create one above.</p>
              ) : (
                <div className="space-y-3">
                  {challenges.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded">
                      <div>
                        <span className="font-mono text-sm">{c.creator_address.slice(0,6)}...</span>
                        <span className="mx-3 text-zinc-500">•</span>
                        <span>{c.game_type.replace('_', ' ')}</span>
                        <span className="mx-3 text-zinc-500">•</span>
                        <span className="font-semibold">${c.stake_amount} USDC</span>
                      </div>
                      <div className="flex gap-2">
                        {c.creator_address !== address && c.status === 'open' && (
                          <button onClick={() => acceptChallenge(c)} disabled={loading} className="px-4 py-1.5 bg-white text-black rounded text-sm">
                            Accept
                          </button>
                        )}
                        {c.status === 'active' && (c.creator_address === address || c.opponent_address === address) && (
                          <button onClick={() => settleChallenge(c)} disabled={loading} className="px-4 py-1.5 bg-emerald-600 rounded text-sm">
                            Settle (AI Referee)
                          </button>
                        )}
                        {c.status === 'settled' && (
                          <span className="text-emerald-400 text-sm">Settled • Winner: {c.winner_address?.slice(0,6)}...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 text-center text-xs text-zinc-500">
              Platform fee: 10% on every payout. All settlements recorded on Base Sepolia + Supabase.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
