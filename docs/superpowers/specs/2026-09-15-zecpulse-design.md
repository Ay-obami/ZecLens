# ZecPulse Design

Date: 2026-09-15
Status: Approved design, pending implementation plan

## Goal

Build a small, reliable Zcash network dashboard for the Mini Build Challenge. The app must visibly prove that it is connected to the live Zcash network and using Zebra RPC methods. The submission should optimize for RPC integration and functionality rather than feature breadth.

## Product concept

ZecPulse is a live Zcash network pulse dashboard. A visitor opens one page and immediately sees current chain state, node health, mempool activity, and privacy-pool balances from Zcash mainnet.

The page should feel alive through periodic refreshes and a visible block heartbeat, but it must remain simple enough to build, test, and submit before the September 16 deadline.

## Architecture

Use a single Next.js + TypeScript project so the frontend and server-side RPC proxy deploy together.

Data flow:

1. Browser requests `/api/zcash/snapshot`.
2. The Next.js server calls the Tatum Zcash mainnet gateway with the API key stored only on the server.
3. The server normalizes Zebra RPC responses into a compact frontend snapshot.
4. The UI renders the snapshot and refreshes on a short interval without exposing credentials.

Remote RPC endpoint:

`https://zcash-mainnet.gateway.tatum.io`

Authentication:

`x-api-key: <TATUM_API_KEY>`

The app must never expose `TATUM_API_KEY` to browser code.

## Verified RPC methods

The following methods have already been tested successfully against the Tatum Zebrad-backed gateway:

- `getblockchaininfo`
- `getnetworkinfo`
- `getmempoolinfo`
- `getbestblockhash`
- `getblock`

These five methods exceed the challenge requirement of three RPC methods.

### `getblockchaininfo`

Use for:

- chain name
- current block height
- estimated height
- sync progress
- best block hash
- difficulty
- chain supply
- value-pool balances
- active network upgrades

Observed value pools include:

- transparent
- sprout
- sapling
- orchard
- lockbox
- ironwood

### `getnetworkinfo`

Use for:

- Zebra version/subversion
- protocol version
- peer connection count
- network reachability

### `getmempoolinfo`

Use for:

- mempool transaction count
- mempool byte size
- memory usage

### `getbestblockhash`

Use to identify the current tip before fetching its full block data.

### `getblock`

Use for:

- latest block height
- latest block hash
- block timestamp
- block size
- transaction count
- difficulty
- previous block hash
- value-pool balances
- per-block value-pool deltas

## UI scope

The landing page contains four primary sections.

### 1. Block Heartbeat

Show:

- latest block height
- latest block hash
- time since block was mined
- transaction count
- block size
- sync state

When the block hash changes between refreshes, visually pulse the block card briefly.

### 2. Network Health

Show:

- Zebra version
- peer connection count
- protocol version
- chain/network name
- sync percentage
- connected/synced status

### 3. Privacy Pulse

Visualize the current ZEC distribution across value pools.

Show at minimum:

- transparent
- sprout
- sapling
- orchard
- ironwood
- lockbox

Treat `lockbox` separately from shielded privacy pools. Do not include it in a shielded-total calculation.

Derived metric:

`shieldedZec = sprout + sapling + orchard + ironwood`

`shieldedPercent = shieldedZec / chainSupply * 100`

### 4. Mempool Pulse

Show:

- transaction count
- total bytes
- simple activity status such as `Quiet`, `Active`, or `Busy`

The status is derived locally from mempool size thresholds and is not presented as a canonical Zebra field.

## Optional lightweight section

A small `Latest Block Impact` panel may show value-pool deltas from `getblock`, for example transparent or lockbox changes in the newest block. This should only be included if it does not complicate the core build.

## Refresh and caching strategy

The free Tatum account is limited to 3 requests per second, so the server must avoid one uncached RPC fan-out per browser poll.

Use a short-lived in-memory server cache for the normalized snapshot.

Recommended behavior:

- Browser polls `/api/zcash/snapshot` every 10 seconds.
- Server serves cached data when the snapshot is younger than roughly 15 seconds.
- On refresh, call `getblockchaininfo`, `getnetworkinfo`, `getmempoolinfo`, and `getbestblockhash`.
- Call `getblock` for the latest hash.
- Concurrent RPC calls must not exceed the provider's practical rate limit. Use a small request queue or staged concurrency if necessary.

If a new block hash is unchanged, future optimization may reuse the previous `getblock` payload, but this is optional for V1.

## API response shape

`GET /api/zcash/snapshot` should return a stable normalized object similar to:

```json
{
  "updatedAt": "2026-09-15T08:00:00.000Z",
  "chain": {
    "name": "main",
    "height": 3484055,
    "estimatedHeight": 3484055,
    "syncPercent": 99.9999,
    "difficulty": 336330589.627912,
    "supply": 16933468.9155448
  },
  "node": {
    "version": "/Zebra:6.2.1/",
    "protocolVersion": 170160,
    "connections": 75
  },
  "mempool": {
    "count": 5,
    "bytes": 10133,
    "usage": 10133
  },
  "block": {
    "hash": "...",
    "height": 3484055,
    "time": 1789460347,
    "size": 1630,
    "transactions": 1,
    "previousBlockHash": "..."
  },
  "pools": [
    { "id": "transparent", "zec": 0, "delta": 0 },
    { "id": "sprout", "zec": 0, "delta": 0 },
    { "id": "sapling", "zec": 0, "delta": 0 },
    { "id": "orchard", "zec": 0, "delta": 0 },
    { "id": "lockbox", "zec": 0, "delta": 0 },
    { "id": "ironwood", "zec": 0, "delta": 0 }
  ],
  "privacy": {
    "shieldedZec": 0,
    "shieldedPercent": 0
  }
}
```

Exact values are runtime data; the shape is the contract.

## Error handling

The app should fail visibly and safely.

- Missing `TATUM_API_KEY`: API returns a clear configuration error.
- RPC timeout/provider failure: API returns a typed upstream error without leaking credentials.
- Partial RPC failure: prefer returning an error for the snapshot rather than displaying a misleading partially healthy state in V1.
- Frontend error state: show `RPC unavailable` with a retry action and keep the last successful snapshot in memory if one exists.
- Loading state: use skeletons or compact placeholders instead of blank cards.

## Environment variables

`.env.example`:

```env
TATUM_API_KEY=
ZCASH_RPC_URL=https://zcash-mainnet.gateway.tatum.io
```

`.env.local` must remain ignored by Git.

## Project structure

```text
ZecPulse/
├── app/
│   ├── api/zcash/snapshot/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BlockHeartbeat.tsx
│   ├── MempoolPulse.tsx
│   ├── NetworkHealth.tsx
│   └── PrivacyPulse.tsx
├── lib/
│   ├── snapshot.ts
│   ├── types.ts
│   └── zebra-rpc.ts
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The exact scaffold may differ slightly if current Next.js conventions make a simpler layout preferable, but responsibilities should remain separated.

## Testing

At minimum:

- unit test RPC response normalization
- unit test shielded-balance calculation, explicitly excluding transparent and lockbox balances
- unit test sync-percentage normalization
- unit test mempool activity-state derivation
- test API behavior when environment configuration is missing
- run lint
- run production build

A final manual live test must be performed with the user's real Tatum key on their machine.

## README requirements

The README must include:

- what ZecPulse does
- architecture overview
- exact Zebra RPC methods used
- setup instructions
- environment variables
- run commands
- note that Tatum's Zcash mainnet gateway is used as the remote Zebra RPC provider
- screenshots/demo link if available before submission

## Non-goals for V1

Do not add:

- wallet creation
- transaction sending
- Zallet integration
- Zaino integration
- authentication
- database/storage
- user accounts
- historical charts requiring persistent data
- arbitrary user-supplied RPC endpoints

These features add risk without materially improving the challenge score.

## Success criteria

The build is submission-ready when:

1. The landing page loads and clearly shows live Zcash mainnet data.
2. At least five verified Zebra RPC methods are used server-side.
3. The UI visibly updates without a page reload.
4. The Tatum API key never appears in browser code or committed files.
5. Privacy-pool balances and shielded percentage are derived correctly.
6. RPC/provider errors are presented cleanly.
7. `npm test`, lint, and production build pass.
8. README contains concise run and submission instructions.
