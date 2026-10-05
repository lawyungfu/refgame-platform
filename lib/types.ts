export interface Challenge {
  id: string;
  creator_address: string;
  opponent_address?: string;
  game_type: 'rock_paper_scissors' | 'tic_tac_toe' | 'gomoku';
  stake_amount: number;
  status: 'open' | 'active' | 'settled';
  winner_address?: string;
  tx_hash?: string;
  created_at: string;
  settled_at?: string;
}

export interface GameMove {
  challenge_id: string;
  player_address: string;
  move_data: any;
  timestamp: string;
}
