import { supabase } from './supabase';
import type { Challenge, GameType } from './types';

export const PLATFORM_FEE_RATE = 0.1;

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  return supabase;
}

export async function fetchChallenges(address?: string): Promise<Challenge[]> {
  const client = requireClient();
  let query = client.from('challenges').select('*').order('created_at', { ascending: false }).limit(50);

  query = address
    ? query.or(`status.eq.open,creator_address.eq.${address},opponent_address.eq.${address}`)
    : query.eq('status', 'open');

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Challenge[];
}

export async function createChallenge(input: { creator: string; gameType: GameType; stake: number }) {
  const { error } = await requireClient().from('challenges').insert({
    creator_address: input.creator,
    game_type: input.gameType,
    stake_amount: input.stake,
    status: 'open',
  });
  if (error) throw new Error(error.message);
}

export async function acceptChallenge(id: string, opponent: string) {
  const { error } = await requireClient()
    .from('challenges')
    .update({ opponent_address: opponent, status: 'active' })
    .eq('id', id)
    .eq('status', 'open');
  if (error) throw new Error(error.message);
}

export async function settleChallenge(challenge: Challenge) {
  if (!challenge.opponent_address) throw new Error('Challenge has no opponent yet.');
  const winner = Math.random() > 0.5 ? challenge.creator_address : challenge.opponent_address;
  const { error } = await requireClient()
    .from('challenges')
    .update({ status: 'settled', winner_address: winner, settled_at: new Date().toISOString() })
    .eq('id', challenge.id)
    .eq('status', 'active');
  if (error) throw new Error(error.message);
  return winner;
}

export function shortAddress(address?: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}
