# ZecPulse

ZecPulse is a focused live dashboard for the Zcash Mini Build Challenge. It connects to Zcash mainnet through a remote **Zebra (zebrad) JSON-RPC** gateway and turns raw node responses into a readable network pulse: latest block activity, node health, mempool activity, ZEC value-pool distribution, and per-block pool movement.

The project deliberately stays small: no wallet, database, login, or transaction flow. The goal is to make the live Zcash network visibly come through the screen.

## What it does

- Shows the latest block height, hash, age, transaction count, and size.
- Shows Zebra version, protocol version, peer connections, chain, sync progress, and difficulty.
- Shows current mempool transaction count, byte size, memory usage, and a locally derived activity label.
- Visualizes Transparent, Sprout, Sapling, Orchard, Lockbox, and Ironwood balances.
- Calculates the shielded share of supply using **Sprout + Sapling + Orchard + Ironwood**. Transparent and Lockbox are intentionally excluded.
- Shows non-zero value-pool deltas reported by the latest block.
- Polls every 10 seconds while the server caches snapshots for 15 seconds to reduce remote RPC usage.
- Retains the last successful snapshot if a later refresh temporarily fails.

## Live features

The landing page is the application itself. When the RPC connection is configured, visitors immediately see live Zcash mainnet data rather than static demo content.

A new block hash triggers a short heartbeat pulse. The page also makes the data source explicit with **Zcash Mainnet — Live** and **Powered by Zebra RPC** status text.

## Architecture

```text
Browser
  |
  | GET /api/zcash/snapshot
  v
Next.js server
  |
  | x-api-key (server only)
  v
Tatum Zcash Mainnet RPC Gateway
  |
  v
Zebra / Zcash Mainnet
```

The browser never calls the remote node directly. `TATUM_API_KEY` is read only by server-side code and is never returned by the API route.

The server normalizes five Zebra RPC responses into one stable `ZecSnapshot` object. A short in-memory cache prevents every browser poll from creating a fresh five-request RPC burst.

## Zebra RPC methods used

ZecPulse uses five verified methods:

| RPC method | Used for |
| --- | --- |
| `getblockchaininfo` | Chain height, estimated height, sync progress, difficulty, supply, network upgrades, and value pools |
| `getnetworkinfo` | Zebra version, protocol version, peer connection count, and network reachability |
| `getmempoolinfo` | Unconfirmed transaction count, serialized bytes, and memory usage |
| `getbestblockhash` | Canonical current tip hash |
| `getblock` | Latest block metadata, transaction count, timestamp, size, previous hash, and value-pool deltas |

The default remote endpoint is:

```text
https://zcash-mainnet.gateway.tatum.io
```

Tatum's Zcash mainnet gateway is backed by **zebrad**. ZecPulse stages RPC calls and caches the resulting snapshot to stay friendly to the free gateway rate limit.

## Local setup

Requirements:

- Node.js 22 or newer recommended
- npm
- A Tatum API key with Zcash mainnet access

Clone and install:

```bash
git clone https://github.com/Ay-obami/ZecPulse.git
cd ZecPulse
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
TATUM_API_KEY=your_mainnet_api_key_here
ZCASH_RPC_URL=https://zcash-mainnet.gateway.tatum.io
```

Do not commit `.env.local` or paste your real key into source files.

## Running the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The first uncached snapshot can take a little over a second because the server deliberately stages the five remote RPC calls to respect the free provider's request rate.

## Testing

Run the unit suite:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

The tests cover privacy calculations, sync normalization, mempool activity, secure RPC configuration/transport, five-method snapshot normalization, snapshot caching, and safe API error responses.

## Security notes

- The Tatum key is sent only in the server-side `x-api-key` header.
- `.env*` files are ignored except `.env.example`.
- RPC errors are sanitized before they reach the browser.
- Upstream response bodies and credentials are not serialized into API errors.
- Browser code talks only to `/api/zcash/snapshot`.

## Mini Build Challenge requirements

| Requirement | ZecPulse |
| --- | --- |
| Landing page | Live single-page network dashboard |
| Connect to a Zcash node | Remote Tatum gateway backed by Zebra |
| Use at least 3 RPC methods | Uses 5 verified Zebra RPC methods |
| Display live blockchain data | Blocks, node/network, mempool, supply/value pools, sync state |

## Project structure

```text
app/
  api/zcash/snapshot/route.ts   Safe server API
  globals.css                   Responsive dashboard styles
  layout.tsx                    Metadata/root layout
  page.tsx                      Landing page
components/                     Live dashboard cards and polling UI
lib/
  metrics.ts                    Derived privacy/sync/mempool helpers
  snapshot.ts                   RPC orchestration + normalization + cache
  types.ts                      Stable snapshot/upstream types
  zebra-rpc.ts                  Secure JSON-RPC transport
tests/                          Unit tests
```

## Submission status

Built for the Zcash Mini Build Challenge, September 2026.
