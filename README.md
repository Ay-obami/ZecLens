# ZecPulse

ZecPulse is a live Zcash network observatory built for the Zcash Mini Build Challenge. It turns raw Zcash mainnet node responses into a polished product experience: a public landing page with live network proof and a dedicated dashboard for block activity, node health, mempool activity, ZEC value-pool distribution, and per-block pool movement.

The project deliberately stays focused: no wallet, database, login, or transaction flow. The goal is to make the live Zcash network understandable at a glance while keeping the underlying RPC integration visible and verifiable.

## Product experience

ZecPulse now has two user-facing surfaces:

```text
/                     Product landing page with cached live mainnet teaser
/dashboard            Full live Zcash network observatory
/api/zcash/snapshot   Server-side normalized snapshot endpoint
```

The landing page introduces the product, shows current block height, Zebra version, peers, mempool activity, privacy-pool distribution, and the five RPC methods behind the experience. The dashboard remains the dense live telemetry view and refreshes every 10 seconds.

Both surfaces use the same cached server snapshot, so the landing page does not create a second independent burst of remote RPC traffic.

## What it does

- Shows the latest block height, hash, age, transaction count, and size.
- Shows Zebra version, protocol version, peer connections, chain, sync progress, and difficulty.
- Shows current mempool transaction count, byte size, memory usage, and a locally derived activity label.
- Visualizes Transparent, Sprout, Sapling, Orchard, Lockbox, and Ironwood balances.
- Calculates the shielded share of supply using **Sprout + Sapling + Orchard + Ironwood**. Transparent and Lockbox are intentionally excluded.
- Shows non-zero value-pool deltas reported by the latest block.
- Polls the dashboard every 10 seconds and the landing page every 15 seconds while the server caches snapshots for 15 seconds.
- Retains the last successful snapshot if a later refresh temporarily fails.
- Keeps the landing page usable when live data is temporarily unavailable.

## Live features

The landing page immediately proves the application is connected to Zcash mainnet with live block, node, peer, mempool, and privacy data. Visitors can then open `/dashboard` for the full network observatory.

A new block hash triggers a short heartbeat pulse in the dashboard. Live status, retry handling, stale-data retention, and graceful unavailable states keep the interface useful during transient RPC failures.

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

Open the product landing page:

```text
http://localhost:3000
```

Open the full observatory directly:

```text
http://localhost:3000/dashboard
```

The first uncached snapshot can take a little over a second because the server deliberately stages the five remote RPC calls to respect the free provider's request rate.

## Testing

```bash
npm test
npm run lint
npm run build
```

The tests cover privacy calculations, sync normalization, mempool activity, secure RPC configuration/transport, client snapshot transport, five-method snapshot normalization, snapshot caching, safe API errors, route structure, and landing-page metric helpers.

## Security notes

- The Tatum key is sent only in the server-side `x-api-key` header.
- `.env*` files are ignored except `.env.example`.
- RPC errors are sanitized before they reach the browser.
- Upstream response bodies and credentials are not serialized into API errors.
- Browser code talks only to `/api/zcash/snapshot`.

## Mini Build Challenge requirements

| Requirement | ZecPulse |
| --- | --- |
| Landing page | Dedicated responsive product landing page with live mainnet teaser |
| Connect to a Zcash node | Remote gateway backed by Zebra |
| Use at least 3 RPC methods | Uses 5 verified Zebra RPC methods |
| Display live blockchain data | Landing teaser plus full block, network, mempool, supply/value-pool, and sync telemetry |

## Project structure

```text
app/
  api/zcash/snapshot/route.ts   Safe server API
  dashboard/page.tsx            Full live network observatory route
  globals.css                   Shared dashboard/global styles
  layout.tsx                    Metadata/root layout
  page.tsx                      Product landing route
components/
  landing/                      Responsive landing-page sections and live teaser
  ZecPulseDashboard.tsx         Dashboard polling/product shell
  BlockHeartbeat.tsx            Latest block telemetry
  NetworkHealth.tsx             Node/network health
  MempoolPulse.tsx              Mempool telemetry
  PrivacyPulse.tsx              Dashboard privacy distribution
  LatestBlockImpact.tsx         Latest-block value-pool movement
lib/
  client-snapshot.ts            Shared browser snapshot transport
  landing-metrics.ts            Landing freshness/pool helpers
  metrics.ts                    Derived privacy/sync/mempool helpers
  snapshot.ts                   RPC orchestration + normalization + cache
  types.ts                      Stable snapshot/upstream types
  zebra-rpc.ts                  Secure JSON-RPC transport
tests/                          Unit and route-structure tests
```

## Submission status

Built for the Zcash Mini Build Challenge, September 2026.
