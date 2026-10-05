# RefGame Platform

P2P escrow gaming platform — income-generating automation on Base Sepolia.

Users create challenges with USDC wagers, opponents accept, play, and the AI referee settles payouts automatically (10% platform fee).

## Features
- Wallet connection (Base Sepolia via wagmi/viem)
- Create & accept challenges with real USDC stakes
- Multiple game types (Rock-Paper-Scissors, Tic-Tac-Toe, Gomoku)
- Deterministic AI referee
- Automated on-chain settlement + Supabase state
- 10% platform fee on every payout

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- wagmi + viem (Base Sepolia)
- Supabase (PostgreSQL + realtime)
- shadcn/ui components

## Quick Start

```bash
git clone https://github.com/lawyungfu/refgame-platform.git
cd refgame-platform
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

## Deployment

The project is ready for Vercel deployment. Connect the repository in Vercel and add the environment variables above.

## Income Model

Every settled challenge deducts a 10% platform fee. The remaining 90% goes to the winner. All fees are tracked in Supabase for transparent reporting.

## License

MIT
