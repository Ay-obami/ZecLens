# ZecPulse

**See Zcash move in real time.**

ZecPulse is a live Zcash mainnet observatory built for the **Zcash Mini Build Challenge**. It connects to a remote Zcash node, uses five live RPC methods, and turns raw node responses into a readable view of blocks, peers, mempool activity, network health, synchronization, supply, and Zcash privacy pools.

## Live demo

- **Landing page:** https://zec-pulse-snowy.vercel.app/
- **Full network observatory:** https://zec-pulse-snowy.vercel.app/dashboard

The landing page itself displays live Zcash mainnet data, while `/dashboard` provides the full observatory.

## Challenge requirements

| Requirement | ZecPulse |
| --- | --- |
| Landing page | ✅ Dedicated responsive landing page with live mainnet telemetry |
| Connect to a Zcash node | ✅ Remote Zcash mainnet node backed by Zebra |
| Use at least 3 RPC methods | ✅ Uses 5 verified RPC methods |
| Display live blockchain data | ✅ Blocks, network, peers, mempool, sync, supply, and value pools |

## RPC methods used

ZecPulse uses five live Zcash RPC methods:

| RPC method | Used for |
| --- | --- |
| `getblockchaininfo` | Chain height, estimated height, sync progress, difficulty, issued supply, network upgrades, and value pools |
| `getnetworkinfo` | Node version, protocol version, peer connection count, and network reachability |
| `getmempoolinfo` | Unconfirmed transaction count, serialized bytes, and memory usage |
| `getbestblockhash` | Canonical hash of the current chain tip |
| `getblock` | Latest block height, hash, timestamp, size, transaction count, previous hash, and value-pool deltas |

## What it shows live

ZecPulse displays:

- latest block height
- latest block hash
- block age
- transaction count in the latest block
- latest block size
- network difficulty
- node version
- protocol version
- peer connection count
- chain synchronization percentage
- mempool transaction count
- mempool serialized size and memory usage
- current issued ZEC supply
- Transparent, Sprout, Sapling, Orchard, Lockbox, and Ironwood balances
- total shielded ZEC
- percentage of issued supply currently shielded
- latest-block value-pool movement

## Product experience

ZecPulse has two user-facing surfaces:

```text
/                     Product landing page with cached live mainnet telemetry
/dashboard            Full live Zcash network observatory
/api/zcash/snapshot   Server-side normalized snapshot endpoint
```

### Block Heartbeat

Shows the newest block height, hash, age, transaction count, and size. When a new block is detected, the dashboard produces a short heartbeat pulse.

### Network Health

Shows node version, peer connections, synchronization progress, protocol version, chain state, and network difficulty.

### Mempool Pulse

Shows the current number of unconfirmed transactions, serialized size, memory usage, and a locally derived activity state.

### Privacy Pulse

Visualizes how ZEC is distributed across Transparent, Sprout, Sapling, Orchard, Lockbox, and Ironwood value pools.

The shielded total intentionally includes only:

```text
Sprout + Sapling + Orchard + Ironwood
```

Transparent ZEC is excluded, and Lockbox is displayed separately as locked value.

### Latest Block Impact

Shows non-zero value-pool changes reported by the latest block.

## Architecture

```text
Browser
   |
   | GET /api/zcash/snapshot
   v
Next.js server
   |
   | JSON-RPC requests
   v
Remote Zebra node
   |
   v
Zcash Mainnet
```

The browser never receives RPC credentials and never calls the remote node directly. The server combines the five RPC responses into one normalized `ZecSnapshot`, sanitizes upstream errors, and briefly caches the result before returning it to the frontend.

The landing page polls every 15 seconds and the full dashboard polls every 10 seconds. Both consume the same server-side cached snapshot.

## Tech stack

- Next.js 16
- React
- TypeScript
- CSS Modules / responsive CSS
- Zcash Zebra JSON-RPC
- Vitest
- Vercel

## Local setup

### Requirements

- Node.js 22 or newer recommended
- npm
- A remote Zcash mainnet RPC endpoint and API key

Clone and install:

```bash
git clone https://github.com/Ay-obami/ZecPulse.git
cd ZecPulse
npm install
cp .env.example .env.local
```

Configure `.env.local`:

```env
TATUM_API_KEY=your_mainnet_api_key_here
ZCASH_RPC_URL=https://zcash-mainnet.gateway.tatum.io
```

Do not commit `.env.local` or expose the API key in client-side code.

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Full observatory:

```text
http://localhost:3000/dashboard
```

## Testing

```bash
npm test
npm run lint
npm run build
```

The test suite covers privacy calculations, sync normalization, mempool activity, RPC transport, snapshot normalization, caching, API error handling, route structure, and landing-page metric helpers.

## Security notes

- RPC credentials remain server-side.
- `.env*` files are ignored except `.env.example`.
- RPC errors are sanitized before reaching the browser.
- Upstream response bodies and credentials are not serialized into API errors.
- Browser code talks only to `/api/zcash/snapshot`.

## Why this project

The challenge is about proving that an application can talk to the Zcash network and make the result visible. ZecPulse keeps that goal focused: it uses five live RPC methods and turns the responses into an understandable view of what Zcash mainnet is doing right now instead of simply dumping raw JSON onto a page.

Built for the **Zcash Mini Build Challenge — September 2026**.
