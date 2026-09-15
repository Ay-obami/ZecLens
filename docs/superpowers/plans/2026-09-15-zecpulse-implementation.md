# ZecPulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a submission-ready Next.js dashboard that securely calls five verified Zebra RPC methods through Tatum and renders live Zcash mainnet block, node, mempool, and privacy-pool data.

**Architecture:** A single Next.js + TypeScript app exposes `GET /api/zcash/snapshot`. Server-only modules call Tatum's Zebrad-backed JSON-RPC gateway, normalize the responses, derive privacy metrics, and cache the normalized snapshot for 15 seconds. A client dashboard polls the API every 10 seconds, retains the last successful snapshot on transient errors, and visually pulses when a new block hash appears.

**Tech Stack:** Next.js App Router, React, TypeScript, native `fetch`, Vitest, ESLint, CSS.

**Spec:** `docs/superpowers/specs/2026-09-15-zecpulse-design.md`

## Global Constraints

- Use the remote RPC endpoint `https://zcash-mainnet.gateway.tatum.io` by default.
- Send the Tatum key only from server-side code in the `x-api-key` header.
- Never expose `TATUM_API_KEY` to browser code, API responses, logs, or committed files.
- Use these five verified Zebra RPC methods: `getblockchaininfo`, `getnetworkinfo`, `getmempoolinfo`, `getbestblockhash`, and `getblock`.
- Browser polling interval: 10 seconds.
- Server snapshot cache TTL: 15 seconds.
- Respect the free-provider limit of 3 RPC requests per second by staging calls rather than firing all five at once.
- `lockbox` is not a shielded privacy pool and must be excluded from `shieldedZec` and `shieldedPercent`.
- V1 has no wallet, Zallet, Zaino, auth, database, historical persistence, or transaction sending.
- `npm test`, lint, and production build must pass before calling the build complete.
- A final live RPC test uses the user's local `.env.local`; secrets are never committed.

---

## File Map

- `package.json` — project scripts and runtime/dev dependencies.
- `tsconfig.json` — strict TypeScript configuration and `@/*` path alias.
- `next.config.ts` — minimal Next.js configuration.
- `eslint.config.mjs` — Next.js/TypeScript lint configuration.
- `vitest.config.ts` — Vitest configuration and path alias.
- `.gitignore` — ignore build output, dependencies, `.env*` except `.env.example`.
- `.env.example` — documented RPC environment variables with no secret values.
- `app/layout.tsx` — page metadata and root HTML shell.
- `app/page.tsx` — mounts the live dashboard.
- `app/globals.css` — complete responsive visual system.
- `app/api/zcash/snapshot/route.ts` — public GET endpoint; maps service/config failures to safe JSON errors.
- `components/ZecPulseDashboard.tsx` — client polling, retained-last-good-data behavior, new-block detection, retry.
- `components/BlockHeartbeat.tsx` — latest-block presentation.
- `components/NetworkHealth.tsx` — chain/node/sync presentation.
- `components/PrivacyPulse.tsx` — pool distribution and shielded metric presentation.
- `components/MempoolPulse.tsx` — mempool count/bytes/activity presentation.
- `components/LatestBlockImpact.tsx` — lightweight latest block value-pool delta panel.
- `lib/types.ts` — upstream RPC types and stable frontend `ZecSnapshot` contract.
- `lib/metrics.ts` — pure derived metric helpers.
- `lib/zebra-rpc.ts` — server-only JSON-RPC transport and configuration.
- `lib/snapshot.ts` — staged RPC orchestration, normalization, and 15-second cache.
- `tests/metrics.test.ts` — pure metric unit tests.
- `tests/zebra-rpc.test.ts` — transport/config tests with mocked fetch.
- `tests/snapshot.test.ts` — normalization, orchestration, and cache tests.
- `tests/api-route.test.ts` — API missing-config/success/error behavior.
- `README.md` — challenge-focused setup, architecture, RPC inventory, and run instructions.

---

### Task 1: Scaffold a strict, testable Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run lint`, and `npm run build` scripts used by every later task.
- Produces: `@/*` alias resolving to the repository root.

- [ ] **Step 1: Create package and TypeScript configuration**

Create `package.json` with scripts:

```json
{
  "name": "zecpulse",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@eslint/eslintrc": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

Create strict `tsconfig.json` with `"paths": { "@/*": ["./*"] }`, `moduleResolution: "bundler"`, `jsx: "preserve"`, `noEmit: true`, and Next's TypeScript plugin.

- [ ] **Step 2: Create framework/test/lint config**

Create minimal `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs` using `FlatCompat` with `next/core-web-vitals` and `next/typescript`, and `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

- [ ] **Step 3: Protect secrets and document environment variables**

Create `.gitignore` with at least:

```gitignore
node_modules/
.next/
out/
coverage/
.env*
!.env.example
.DS_Store
```

Create `.env.example`:

```env
TATUM_API_KEY=
ZCASH_RPC_URL=https://zcash-mainnet.gateway.tatum.io
```

- [ ] **Step 4: Add the minimal root shell**

Create `app/layout.tsx` with title `ZecPulse — Live Zcash Network Pulse`, description `Live Zcash mainnet data powered by Zebra RPC`, and import `./globals.css`.

Create a temporary `app/page.tsx` that renders `<main>ZecPulse</main>` and a minimal `app/globals.css` reset so the app has a valid route before feature work.

- [ ] **Step 5: Install and verify scaffold**

Run:

```bash
npm install
npm test
npm run lint
npm run build
```

Expected: dependency install succeeds; Vitest reports no failing tests; lint succeeds; Next production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next-env.d.ts next.config.ts eslint.config.mjs vitest.config.ts .gitignore .env.example app
 git commit -m "chore: scaffold ZecPulse Next.js app"
```

---

### Task 2: Define the stable snapshot contract and derived metrics

**Files:**
- Create: `lib/types.ts`
- Create: `lib/metrics.ts`
- Create: `tests/metrics.test.ts`

**Interfaces:**
- Produces: `ZecSnapshot`, `ValuePool`, and upstream RPC response types.
- Produces: `calculatePrivacy(pools, chainSupply)`, `normalizeSyncPercent(progress)`, `getMempoolActivity(count)`, `formatBytes(bytes)`.

- [ ] **Step 1: Write failing metric tests**

Create `tests/metrics.test.ts` covering all critical derived behavior:

```ts
import { describe, expect, it } from "vitest";
import {
  calculatePrivacy,
  getMempoolActivity,
  normalizeSyncPercent,
} from "@/lib/metrics";

const pools = [
  { id: "transparent", zec: 100, delta: 0 },
  { id: "sprout", zec: 10, delta: 0 },
  { id: "sapling", zec: 20, delta: 0 },
  { id: "orchard", zec: 30, delta: 0 },
  { id: "ironwood", zec: 40, delta: 0 },
  { id: "lockbox", zec: 50, delta: 0 },
];

describe("calculatePrivacy", () => {
  it("counts only shielded pools and excludes transparent and lockbox", () => {
    expect(calculatePrivacy(pools, 250)).toEqual({
      shieldedZec: 100,
      shieldedPercent: 40,
    });
  });
});

describe("normalizeSyncPercent", () => {
  it("converts a fraction to a clamped percentage", () => {
    expect(normalizeSyncPercent(0.999999)).toBeCloseTo(99.9999, 4);
    expect(normalizeSyncPercent(1.2)).toBe(100);
    expect(normalizeSyncPercent(-0.1)).toBe(0);
  });
});

describe("getMempoolActivity", () => {
  it("derives simple local activity labels", () => {
    expect(getMempoolActivity(0)).toBe("Quiet");
    expect(getMempoolActivity(5)).toBe("Active");
    expect(getMempoolActivity(50)).toBe("Busy");
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- tests/metrics.test.ts
```

Expected: FAIL because `lib/metrics.ts` does not exist.

- [ ] **Step 3: Define domain and upstream types**

In `lib/types.ts`, define:

```ts
export type PoolId =
  | "transparent"
  | "sprout"
  | "sapling"
  | "orchard"
  | "lockbox"
  | "ironwood"
  | string;

export interface ValuePool {
  id: PoolId;
  zec: number;
  delta: number;
}

export interface ZecSnapshot {
  updatedAt: string;
  chain: {
    name: string;
    height: number;
    estimatedHeight: number;
    syncPercent: number;
    difficulty: number;
    supply: number;
  };
  node: {
    version: string;
    protocolVersion: number;
    connections: number;
  };
  mempool: {
    count: number;
    bytes: number;
    usage: number;
    activity: "Quiet" | "Active" | "Busy";
  };
  block: {
    hash: string;
    height: number;
    time: number;
    size: number;
    transactions: number;
    previousBlockHash: string;
  };
  pools: ValuePool[];
  privacy: {
    shieldedZec: number;
    shieldedPercent: number;
  };
}
```

Also define the minimal upstream structures required by the five verified RPC responses: `BlockchainInfoRpc`, `NetworkInfoRpc`, `MempoolInfoRpc`, and `BlockRpc`.

- [ ] **Step 4: Implement pure metric helpers**

In `lib/metrics.ts` implement:

```ts
import type { ValuePool } from "@/lib/types";

const SHIELDED_IDS = new Set(["sprout", "sapling", "orchard", "ironwood"]);

export function calculatePrivacy(pools: ValuePool[], chainSupply: number) {
  const shieldedZec = pools
    .filter((pool) => SHIELDED_IDS.has(pool.id))
    .reduce((sum, pool) => sum + pool.zec, 0);

  return {
    shieldedZec,
    shieldedPercent: chainSupply > 0 ? (shieldedZec / chainSupply) * 100 : 0,
  };
}

export function normalizeSyncPercent(progress: number) {
  return Math.min(100, Math.max(0, progress * 100));
}

export function getMempoolActivity(count: number): "Quiet" | "Active" | "Busy" {
  if (count === 0) return "Quiet";
  if (count < 25) return "Active";
  return "Busy";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/metrics.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/metrics.ts tests/metrics.test.ts
 git commit -m "feat: define Zcash snapshot metrics"
```

---

### Task 3: Build a safe server-only Zebra JSON-RPC client

**Files:**
- Create: `lib/zebra-rpc.ts`
- Create: `tests/zebra-rpc.test.ts`

**Interfaces:**
- Produces: `getRpcConfig(env?)` returning `{ url, apiKey }` or throwing `RpcConfigError`.
- Produces: `createZebraRpcClient(config, fetchImpl?)` with generic method `call<T>(method, params?)`.
- Consumes: native `fetch` on the server only.

- [ ] **Step 1: Write failing transport/config tests**

Create tests that assert:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  RpcConfigError,
  ZebraRpcError,
  createZebraRpcClient,
  getRpcConfig,
} from "@/lib/zebra-rpc";

describe("getRpcConfig", () => {
  it("throws when TATUM_API_KEY is absent", () => {
    expect(() => getRpcConfig({ ZCASH_RPC_URL: "https://example.test" })).toThrow(RpcConfigError);
  });
});

describe("createZebraRpcClient", () => {
  it("sends the API key only in x-api-key and returns result", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: { ok: true } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createZebraRpcClient(
      { url: "https://example.test", apiKey: "secret" },
      fetchMock,
    );

    await expect(client.call<{ ok: boolean }>("getblockchaininfo")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "secret" }),
      }),
    );
  });

  it("converts JSON-RPC errors into ZebraRpcError without leaking the API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -1, message: "boom" } }), {
        status: 200,
      }),
    );
    const client = createZebraRpcClient({ url: "https://example.test", apiKey: "secret" }, fetchMock);
    await expect(client.call("getblockchaininfo")).rejects.toBeInstanceOf(ZebraRpcError);
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- tests/zebra-rpc.test.ts
```

Expected: FAIL because `lib/zebra-rpc.ts` does not exist.

- [ ] **Step 3: Implement configuration and transport**

Implement `RpcConfigError` and `ZebraRpcError`. `getRpcConfig()` must use `TATUM_API_KEY`, default `ZCASH_RPC_URL` to `https://zcash-mainnet.gateway.tatum.io`, reject an empty key, and never include the key in exception messages.

Implement `call<T>()` using `fetch` with:

```ts
{
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": config.apiKey,
  },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  cache: "no-store",
  signal: AbortSignal.timeout(8_000),
}
```

Reject non-2xx responses, malformed JSON-RPC responses, and `error` payloads with `ZebraRpcError` containing only safe method/status/code context.

- [ ] **Step 4: Run transport tests**

Run:

```bash
npm test -- tests/zebra-rpc.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/zebra-rpc.ts tests/zebra-rpc.test.ts
 git commit -m "feat: add secure Zebra RPC client"
```

---

### Task 4: Normalize five RPC responses into one cached snapshot

**Files:**
- Create: `lib/snapshot.ts`
- Create: `tests/snapshot.test.ts`

**Interfaces:**
- Consumes: `ZebraRpcClient.call<T>()`, types from `lib/types.ts`, metric helpers from `lib/metrics.ts`.
- Produces: `fetchFreshSnapshot(client): Promise<ZecSnapshot>`.
- Produces: `getCachedSnapshot(client, now?): Promise<ZecSnapshot>`.
- Produces: `resetSnapshotCache()` for deterministic tests only.

- [ ] **Step 1: Write fixture-based failing tests**

Use the already observed live response shapes in fixtures embedded in the test. Assert that normalization produces:

```ts
expect(snapshot.chain).toMatchObject({
  name: "main",
  height: 3484052,
  estimatedHeight: 3484055,
  supply: 16933464.2280448,
});
expect(snapshot.node.version).toBe("/Zebra:6.2.1/");
expect(snapshot.node.connections).toBe(75);
expect(snapshot.mempool).toMatchObject({ count: 5, bytes: 10133, usage: 10133, activity: "Active" });
expect(snapshot.block).toMatchObject({
  height: 3484055,
  transactions: 1,
  size: 1630,
});
expect(snapshot.pools.find((pool) => pool.id === "lockbox")?.delta).toBe(0.1875);
expect(snapshot.privacy.shieldedZec).toBeGreaterThan(0);
```

Also assert the called method order/staging: the first stage contains `getblockchaininfo`, `getnetworkinfo`, and `getmempoolinfo`; after those settle call `getbestblockhash`; then call `getblock` with `[bestHash, 1]`.

Add a cache test that calls `getCachedSnapshot()` twice within 15 seconds and asserts the fake RPC client receives only one five-method refresh.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- tests/snapshot.test.ts
```

Expected: FAIL because `lib/snapshot.ts` does not exist.

- [ ] **Step 3: Implement staged orchestration**

Implement `fetchFreshSnapshot` so no more than three calls start simultaneously:

```ts
const [chain, network, mempool] = await Promise.all([
  client.call<BlockchainInfoRpc>("getblockchaininfo"),
  client.call<NetworkInfoRpc>("getnetworkinfo"),
  client.call<MempoolInfoRpc>("getmempoolinfo"),
]);

const bestHash = await client.call<string>("getbestblockhash");
const block = await client.call<BlockRpc>("getblock", [bestHash, 1]);
```

Normalize `chain.valuePools` primarily from the latest `getblock` response so each pool can include `valueDelta`; fall back to `getblockchaininfo.valuePools` with `delta: 0` if a pool is absent from the block payload.

- [ ] **Step 4: Implement exact normalization rules**

Create `ValuePool[]` from observed upstream fields:

```ts
{
  id: pool.id,
  zec: pool.chainValue,
  delta: pool.valueDelta ?? 0,
}
```

Set chain height from `chain.blocks`, estimated height from `chain.estimatedheight`, sync from `chain.verificationprogress`, supply from `chain.chainSupply.chainValue`, node fields from `getnetworkinfo`, mempool fields from `getmempoolinfo`, and block fields from `getblock`.

Compute `privacy` using `calculatePrivacy` so `transparent` and `lockbox` remain excluded.

- [ ] **Step 5: Implement 15-second in-memory cache**

Keep module-level `{ value, fetchedAt }`. `getCachedSnapshot(client, now = Date.now())` returns the cached value when `now - fetchedAt < 15_000`; otherwise refreshes and replaces the cache. Do not cache failures.

- [ ] **Step 6: Run snapshot and metric tests**

Run:

```bash
npm test -- tests/snapshot.test.ts tests/metrics.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/snapshot.ts tests/snapshot.test.ts
 git commit -m "feat: build cached Zcash network snapshot"
```

---

### Task 5: Expose a safe snapshot API route

**Files:**
- Create: `app/api/zcash/snapshot/route.ts`
- Create: `tests/api-route.test.ts`

**Interfaces:**
- Consumes: `getRpcConfig`, `createZebraRpcClient`, `getCachedSnapshot`.
- Produces: `GET /api/zcash/snapshot` returning `{ data: ZecSnapshot }` on success or `{ error: { code, message } }` on failure.

- [ ] **Step 1: Write failing route tests**

Test missing configuration by temporarily removing `process.env.TATUM_API_KEY`, dynamically importing the route, calling `GET()`, and asserting:

```ts
expect(response.status).toBe(500);
expect(await response.json()).toEqual({
  error: {
    code: "RPC_NOT_CONFIGURED",
    message: "Zcash RPC is not configured on the server.",
  },
});
```

Add a test for upstream failures that mocks the service layer and expects status `502`, code `RPC_UNAVAILABLE`, and no upstream response body or API key in the JSON.

- [ ] **Step 2: Run route tests and confirm failure**

Run:

```bash
npm test -- tests/api-route.test.ts
```

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement GET route**

Set:

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

On success return:

```ts
return Response.json({ data: snapshot }, { status: 200 });
```

On `RpcConfigError`, return the exact safe 500 response from the test. On any upstream/unknown failure, return:

```json
{
  "error": {
    "code": "RPC_UNAVAILABLE",
    "message": "Live Zcash data is temporarily unavailable."
  }
}
```

with HTTP 502. Do not serialize the caught exception.

- [ ] **Step 4: Run route tests**

Run:

```bash
npm test -- tests/api-route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/zcash/snapshot/route.ts tests/api-route.test.ts
 git commit -m "feat: expose live Zcash snapshot API"
```

---

### Task 6: Build the live dashboard components and polling behavior

**Files:**
- Create: `components/ZecPulseDashboard.tsx`
- Create: `components/BlockHeartbeat.tsx`
- Create: `components/NetworkHealth.tsx`
- Create: `components/PrivacyPulse.tsx`
- Create: `components/MempoolPulse.tsx`
- Create: `components/LatestBlockImpact.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: API shape `{ data: ZecSnapshot }`.
- Produces: one-page dashboard that polls every 10 seconds, retains last good data, retries on demand, and flags new blocks.

- [ ] **Step 1: Implement the polling state machine**

Create `ZecPulseDashboard` as a client component with state:

```ts
const [snapshot, setSnapshot] = useState<ZecSnapshot | null>(null);
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [newBlock, setNewBlock] = useState(false);
const previousHash = useRef<string | null>(null);
```

Implement `loadSnapshot()` to fetch `/api/zcash/snapshot` with `{ cache: "no-store" }`. On success, compare the new block hash with `previousHash.current`; if it changed after the first load, set `newBlock` true and clear it after roughly 1.2 seconds. Update `snapshot`, clear `error`, and preserve `snapshot` if a later poll fails.

Use `setInterval(loadSnapshot, 10_000)` and clean it up on unmount.

- [ ] **Step 2: Implement BlockHeartbeat**

Render latest height, shortened hash with full hash in `title`, relative block age calculated from `block.time`, transaction count, formatted block size, and synced/near-tip state. Accept `pulse: boolean` and apply a pulse class only when a new hash arrives.

- [ ] **Step 3: Implement NetworkHealth and MempoolPulse**

`NetworkHealth` renders Zebra subversion, peer connections, protocol version, chain name, and `syncPercent.toFixed(4)%` with a connected/synced badge.

`MempoolPulse` renders transaction count, formatted bytes, usage, and the explicitly derived `Quiet | Active | Busy` label.

- [ ] **Step 4: Implement PrivacyPulse**

Render all observed pools. Use a proportional horizontal bar based on `pool.zec / chain.supply`, but always provide the exact numeric ZEC value as text so tiny pools remain legible.

Visually distinguish:

```ts
const shieldedIds = new Set(["sprout", "sapling", "orchard", "ironwood"]);
```

Render `lockbox` with a `Locked` label, not a `Shielded` label. Show total shielded ZEC and `shieldedPercent` prominently.

- [ ] **Step 5: Implement LatestBlockImpact**

Filter pools to non-zero `delta` values and render signed values such as `+1.3750 ZEC` or `-0.2500 ZEC`. If every delta is zero, render `No value-pool movement reported in this block.`

- [ ] **Step 6: Implement loading/error/last-good-data behavior**

When `snapshot === null && isLoading`, render four skeleton cards. When no snapshot exists and the API fails, render `RPC unavailable` with a `Retry` button. When an existing snapshot is retained after a failed refresh, keep cards visible and show a compact stale-data warning above them.

- [ ] **Step 7: Mount dashboard from the landing page**

Replace the temporary `app/page.tsx` with:

```tsx
import { ZecPulseDashboard } from "@/components/ZecPulseDashboard";

export default function Home() {
  return <ZecPulseDashboard />;
}
```

- [ ] **Step 8: Run type-sensitive tests/lint**

Run:

```bash
npm test
npm run lint
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx components
 git commit -m "feat: add live ZecPulse dashboard"
```

---

### Task 7: Add polished responsive UI and heartbeat motion

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: semantic class names from Task 6.
- Produces: responsive dark Zcash-themed dashboard with clear hierarchy and accessible status states.

- [ ] **Step 1: Define the visual tokens and layout**

Use CSS custom properties for background/surface/text/border/accent/status values, a max-width content container, responsive card grid, and typography that does not depend on external font downloads during build.

The top hero must make these three facts immediately visible:

```text
ZecPulse
Zcash Mainnet — Live
Powered by Zebra RPC
```

Include a small live dot when data is fresh.

- [ ] **Step 2: Style cards and privacy bars**

Use strong contrast, compact metric labels, tabular-number styling where appropriate, horizontal bars with accessible text labels, and responsive collapse to one column on narrow screens.

- [ ] **Step 3: Add heartbeat animation with reduced-motion fallback**

Define a `block-pulse` keyframe affecting border/box-shadow/scale subtly. Wrap animation in:

```css
@media (prefers-reduced-motion: no-preference) {
  .block-card.is-pulsing { animation: block-pulse 1.2s ease-out; }
}
```

Do not make continuous decorative motion mandatory.

- [ ] **Step 4: Style loading and error states**

Skeletons must use a subtle local animation; retry button needs visible keyboard focus. Stale-data warning should not obscure retained data.

- [ ] **Step 5: Run lint and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
 git commit -m "style: polish ZecPulse live dashboard"
```

---

### Task 8: Write submission-ready documentation and perform final verification

**Files:**
- Create or replace: `README.md`

**Interfaces:**
- Produces: exact setup/run instructions for judges and the user.

- [ ] **Step 1: Write README content**

README must contain these sections:

```text
# ZecPulse
What it does
Live features
Architecture
Zebra RPC methods used
Local setup
Environment variables
Running the app
Testing
Security notes
Mini Build Challenge requirements
```

Under `Zebra RPC methods used`, document exactly:

```text
getblockchaininfo — chain height, sync, difficulty, supply and value pools
getnetworkinfo — Zebra version, protocol and peer count
getmempoolinfo — unconfirmed transaction count and memory/byte usage
getbestblockhash — canonical current tip hash
getblock — latest block metadata and value-pool deltas
```

State that `https://zcash-mainnet.gateway.tatum.io` is a Tatum remote gateway backed by Zebrad and the key is server-only.

- [ ] **Step 2: Add exact setup instructions**

Document:

```bash
git clone https://github.com/Ay-obami/ZecPulse.git
cd ZecPulse
npm install
cp .env.example .env.local
```

Then instruct the user to set `TATUM_API_KEY` in `.env.local`, followed by:

```bash
npm run dev
```

and open `http://localhost:3000`.

- [ ] **Step 3: Run the full local verification suite**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: every command exits 0.

- [ ] **Step 4: Perform secret scan before commit**

Run:

```bash
git grep -n "TATUM_API_KEY=" -- ':!docs/**' ':!.env.example'
git status --short
```

Expected: no committed real key values; `.env.local` is absent from status.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md
 git commit -m "docs: prepare ZecPulse hackathon submission"
```

- [ ] **Step 6: User performs the live mainnet acceptance test**

After pulling the final commits, user runs:

```bash
cp .env.example .env.local
# add the real Mainnet Tatum API key to .env.local
npm run dev
```

Acceptance checklist:

```text
[ ] Page says Zcash Mainnet — Live
[ ] Block height/hash are populated
[ ] Zebra version and peer count are populated
[ ] Mempool data is populated
[ ] All six observed value pools are rendered
[ ] Shielded percentage excludes transparent and lockbox
[ ] Latest-block timestamp/transactions update from real getblock data
[ ] Network tab shows no TATUM_API_KEY in browser source or API JSON
[ ] Refreshing/polling does not throw rate-limit errors
```

If a live response differs from the fixture shape, capture the response and adjust only the affected normalization type/parser, preserving the stable frontend `ZecSnapshot` contract.
