# ZecPulse Landing Page V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ZecPulse into a polished two-surface product with a premium live landing page at `/` and the existing network observatory at `/dashboard`, with mobile treated as a first-class target.

**Architecture:** Keep `/api/zcash/snapshot` as the only browser data source and preserve all server-side caching/RPC behavior. Add a small shared browser fetch helper, a landing-only polling controller, focused presentational components, and an isolated CSS Module so the existing dashboard remains stable. Move the existing dashboard route without changing its telemetry behavior.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.3.0, TypeScript, CSS Modules, Vitest, existing Zcash/Zebra snapshot API.

**Spec:** `docs/superpowers/specs/2026-09-15-zecpulse-landing-page-design.md`

## Global Constraints

- `/` is the public landing page and `/dashboard` is the full observatory.
- `/api/zcash/snapshot` remains the single browser-facing live data source.
- API credentials remain server-only.
- Do not add wallet connection, auth, database, historical backend, new RPC methods, or third-party promotional architecture sections.
- Shielded ZEC includes Sprout + Sapling + Orchard + Ironwood only; Transparent and Lockbox remain excluded.
- Landing live data must fail gracefully without hiding static product content.
- Existing dashboard polling, cache assumptions, retry behavior, stale-data retention, and new-block pulse must remain intact.
- Mobile `<640px` must have no horizontal overflow, stacked hero/content, 2×2 live metrics, large touch targets, and no hover dependency.
- Respect `prefers-reduced-motion`, keyboard focus visibility, semantic landmarks, and readable contrast.
- Existing 13 tests must continue to pass.

---

### Task 1: Share the client snapshot transport without changing RPC behavior

**Files:**
- Create: `lib/client-snapshot.ts`
- Create: `tests/client-snapshot.test.ts`
- Modify: `components/ZecPulseDashboard.tsx`

**Interfaces:**
- Produces: `fetchZecSnapshot(signal?: AbortSignal): Promise<ZecSnapshot>`
- Consumes: existing `ZecSnapshot` from `lib/types.ts`
- Later tasks use `fetchZecSnapshot` for landing polling.

- [ ] **Step 1: Write the failing transport tests**

Create `tests/client-snapshot.test.ts` with mocked `globalThis.fetch` covering success and sanitized API failure:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchZecSnapshot } from "@/lib/client-snapshot";

const snapshot = {
  updatedAt: "2026-09-15T09:18:13.930Z",
  chain: { name: "main", height: 3484101, estimatedHeight: 3484102, syncPercent: 99.99, difficulty: 1, supply: 16933540 },
  node: { version: "/Zebra:6.2.1/", protocolVersion: 170160, connections: 7 },
  mempool: { count: 5, bytes: 100, usage: 100, activity: "Active" },
  block: { hash: "abc", height: 3484101, time: 1789463776, size: 71389, transactions: 12, previousBlockHash: "def" },
  pools: [],
  privacy: { shieldedZec: 4894816, shieldedPercent: 28.9 },
};

afterEach(() => vi.restoreAllMocks());

describe("fetchZecSnapshot", () => {
  it("returns normalized snapshot data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: snapshot }), { status: 200 })));
    await expect(fetchZecSnapshot()).resolves.toEqual(snapshot);
  });

  it("throws the API message when the snapshot endpoint fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: "RPC_UNAVAILABLE", message: "Live Zcash data is unavailable." } }), { status: 503 })));
    await expect(fetchZecSnapshot()).rejects.toThrow("Live Zcash data is unavailable.");
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- tests/client-snapshot.test.ts
```

Expected: FAIL because `@/lib/client-snapshot` does not exist.

- [ ] **Step 3: Implement the minimal shared transport**

Create `lib/client-snapshot.ts`:

```ts
import type { ZecSnapshot } from "@/lib/types";

type SnapshotResponse =
  | { data: ZecSnapshot }
  | { error: { code: string; message: string } };

export async function fetchZecSnapshot(signal?: AbortSignal): Promise<ZecSnapshot> {
  const response = await fetch("/api/zcash/snapshot", {
    cache: "no-store",
    signal,
  });
  const payload = (await response.json()) as SnapshotResponse;

  if (!response.ok || !("data" in payload)) {
    throw new Error(
      "error" in payload ? payload.error.message : "Live Zcash data is unavailable.",
    );
  }

  return payload.data;
}
```

Refactor `ZecPulseDashboard.tsx` to call `fetchZecSnapshot()` inside its existing `loadSnapshot` callback while retaining the same timers, pulse logic, retry handling, stale data behavior, and 10-second interval.

- [ ] **Step 4: Verify focused and existing behavior**

Run:

```bash
npm test -- tests/client-snapshot.test.ts tests/api-route.test.ts tests/snapshot.test.ts
```

Expected: all selected tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/client-snapshot.ts components/ZecPulseDashboard.tsx tests/client-snapshot.test.ts
git commit -m "refactor: share client snapshot transport"
```

---

### Task 2: Split the landing and dashboard routes

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `components/landing/LandingPage.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `/` → `LandingPage`, `/dashboard` → `ZecPulseDashboard`
- `LandingPage` is the composition root for all landing sections added in later tasks.

- [ ] **Step 1: Write a route-structure test**

Create `tests/routes.test.ts` using Node file reads so routing intent is checked without introducing a DOM testing dependency:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function source(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("product routes", () => {
  it("renders the landing page at root", async () => {
    expect(await source("app/page.tsx")).toContain("LandingPage");
  });

  it("renders the live observatory at /dashboard", async () => {
    expect(await source("app/dashboard/page.tsx")).toContain("ZecPulseDashboard");
  });
});
```

- [ ] **Step 2: Run the route test and verify it fails**

Run:

```bash
npm test -- tests/routes.test.ts
```

Expected: FAIL because `app/dashboard/page.tsx` and `LandingPage` do not exist yet.

- [ ] **Step 3: Implement the route split**

Create `app/dashboard/page.tsx`:

```tsx
import { ZecPulseDashboard } from "@/components/ZecPulseDashboard";

export default function DashboardPage() {
  return <ZecPulseDashboard />;
}
```

Create an initial `components/landing/LandingPage.tsx` that renders semantic `<main>`, a temporary ZecPulse heading, and a `/dashboard` CTA. Update `app/page.tsx` to render `<LandingPage />`. Update metadata to a product-first description such as `Live Zcash mainnet intelligence for blocks, peers, mempool activity, network health, and privacy pools.`

- [ ] **Step 4: Verify routes compile**

Run:

```bash
npm test -- tests/routes.test.ts
npm run build
```

Expected: route tests PASS and Next build lists both `/` and `/dashboard`.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/dashboard/page.tsx app/layout.tsx components/landing/LandingPage.tsx tests/routes.test.ts
git commit -m "feat: split landing and dashboard routes"
```

---

### Task 3: Add resilient live landing telemetry and privacy data

**Files:**
- Create: `components/landing/LandingLiveData.tsx`
- Create: `components/landing/HeroSection.tsx`
- Create: `components/landing/LiveMetricsStrip.tsx`
- Create: `components/landing/PrivacyOverview.tsx`
- Create: `lib/landing-metrics.ts`
- Create: `tests/landing-metrics.test.ts`
- Modify: `components/landing/LandingPage.tsx`

**Interfaces:**
- Produces: `LandingLiveData` polling wrapper around `fetchZecSnapshot`.
- Produces: `formatFreshness(updatedAt, nowMs): string` and `poolPercent(zec, chainSupply): number`.
- Presentational components consume `ZecSnapshot | null` plus availability state; they do not fetch directly.

- [ ] **Step 1: Write metric helper tests**

Create `tests/landing-metrics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatFreshness, poolPercent } from "@/lib/landing-metrics";

describe("landing metrics", () => {
  it("formats recent snapshot age", () => {
    expect(formatFreshness("2026-09-15T09:18:00.000Z", Date.parse("2026-09-15T09:18:12.000Z"))).toBe("Updated 12 seconds ago");
  });

  it("formats minute-old snapshots", () => {
    expect(formatFreshness("2026-09-15T09:16:00.000Z", Date.parse("2026-09-15T09:18:12.000Z"))).toBe("Updated 2 minutes ago");
  });

  it("returns a safe percentage", () => {
    expect(poolPercent(25, 100)).toBe(25);
    expect(poolPercent(25, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- tests/landing-metrics.test.ts
```

Expected: FAIL because `lib/landing-metrics.ts` does not exist.

- [ ] **Step 3: Implement metrics and polling controller**

Implement `formatFreshness` with non-negative elapsed seconds and singular/plural output, and `poolPercent` with zero-supply protection.

Implement `LandingLiveData` as a client component that:

```ts
const LANDING_POLL_MS = 15_000;
```

- loads immediately through `fetchZecSnapshot`
- polls every 15 seconds
- retains the last successful snapshot if a later request fails
- exposes a retry button when no snapshot has ever loaded
- aborts an in-flight request on unmount
- never exposes credentials or calls the provider directly.

Use the wrapper to feed `HeroSection`, `LiveMetricsStrip`, and `PrivacyOverview` so a single landing poll supplies every live section.

- [ ] **Step 4: Implement the live product copy**

Hero requirements:

```text
See Zcash move in real time.
Live network intelligence that turns raw Zcash mainnet data into a clear view of blocks, peers, mempool activity, network health, and privacy.
Open Live Dashboard
Explore the RPC Stack
```

The live strip must show block height, normalized Zebra version (`6.2.1` rather than `/Zebra:6.2.1/`), peers, mempool count, and freshness. If unavailable, all four metric slots remain visible with `Live data temporarily unavailable` rather than disappearing.

Privacy section must show shielded percentage plus all six categories, label Lockbox as `Locked`, and use the existing snapshot-calculated `privacy.shieldedPercent` instead of recomputing shielded membership in the UI.

- [ ] **Step 5: Verify data behavior and regression suite**

Run:

```bash
npm test -- tests/landing-metrics.test.ts tests/client-snapshot.test.ts tests/metrics.test.ts tests/snapshot.test.ts
```

Expected: all selected tests PASS.

- [ ] **Step 6: Commit**

```bash
git add components/landing lib/landing-metrics.ts tests/landing-metrics.test.ts
git commit -m "feat: add live landing telemetry"
```

---

### Task 4: Build the complete product story and responsive visual system

**Files:**
- Create: `components/landing/SiteHeader.tsx`
- Create: `components/landing/FeatureGrid.tsx`
- Create: `components/landing/HowZecPulseHelps.tsx`
- Create: `components/landing/TechnicalProof.tsx`
- Create: `components/landing/FinalCta.tsx`
- Create: `components/landing/SiteFooter.tsx`
- Create: `components/landing/LandingPage.module.css`
- Modify: `components/landing/LandingPage.tsx`
- Modify: live landing components from Task 3 to use the CSS Module class contract.

**Interfaces:**
- `LandingPage.module.css` owns landing-only visuals; it must not change dashboard card/grid styling.
- Anchor IDs: `#live-network`, `#how-it-works`, `#rpc-stack`.
- Dashboard CTA target: `/dashboard`.

- [ ] **Step 1: Add a copy/structure regression test**

Extend `tests/routes.test.ts` to assert the landing composition source includes these component names and that no provider-promotional architecture copy is introduced:

```ts
it("includes the approved product-story sections", async () => {
  const landing = await source("components/landing/LandingPage.tsx");
  for (const component of ["SiteHeader", "HeroSection", "LiveMetricsStrip", "FeatureGrid", "PrivacyOverview", "HowZecPulseHelps", "TechnicalProof", "FinalCta", "SiteFooter"]) {
    expect(landing).toContain(component);
  }
  expect(landing).not.toContain("Built directly on Zebra RPC");
});
```

- [ ] **Step 2: Run the structure test and verify it fails**

Run:

```bash
npm test -- tests/routes.test.ts
```

Expected: FAIL until the complete section composition exists.

- [ ] **Step 3: Implement header and static product sections**

Build:

- sticky/contained premium header with ZecPulse brand, anchors, mainnet live cue, and `/dashboard` CTA
- `What ZecPulse Reveals`: Block Heartbeat, Network Health, Privacy Pulse
- `How ZecPulse Helps`: Live Network Insights, A More Informed Community, A More Private Future
- compact `TechnicalProof` under `id="rpc-stack"` listing exactly:

```text
getblockchaininfo
getnetworkinfo
getmempoolinfo
getbestblockhash
getblock
```

Do **not** render Tatum/provider cards, provider diagrams, or `Built directly on Zebra RPC` as a promotional section.

- [ ] **Step 4: Implement the premium responsive CSS Module**

Desktop (`>=1024px`):
- max-width product shell around 1240–1320px
- two-column hero
- four live metrics in one row
- three feature cards in one row
- wide privacy visualization/copy composition

Tablet (`640–1023px`):
- simplified hero composition
- live metrics 2×2
- flexible two-column secondary cards

Mobile (`<640px`):
- one-column flow
- hero typography via `clamp(2.4rem, 12vw, 3rem)` or equivalent within the spec target
- stacked/full-width CTAs
- live metrics 2×2
- privacy visual + legend stacked
- method chips wrap without page overflow
- header collapses nonessential anchor links while keeping brand + dashboard action/menu accessible
- minimum ~44px CTA/button touch height

Add `overflow-x: clip` only as a defensive guard; fix actual oversized children. Add `:focus-visible` outlines and a `@media (prefers-reduced-motion: reduce)` rule that removes nonessential transitions/animations.

Visual language: near-black/charcoal surfaces, warm Zcash gold, thin borders/grid lines, restrained radial glow, no cyberpunk neon overload.

- [ ] **Step 5: Build the final CTA/footer**

Use:

```text
The Zcash network is live. Watch it move.
Launch Network Observatory
```

Footer should identify ZecPulse, the Zcash Mini Build Challenge, live Zcash/Zebra RPC data, and GitHub. Keep infrastructure references factual and compact.

- [ ] **Step 6: Verify structure, lint, and production compilation**

Run:

```bash
npm test -- tests/routes.test.ts
npm run lint
npm run build
```

Expected: all PASS; build includes `/`, `/dashboard`, and `/api/zcash/snapshot`.

- [ ] **Step 7: Commit**

```bash
git add components/landing tests/routes.test.ts
git commit -m "feat: build responsive ZecPulse landing experience"
```

---

### Task 5: Integrate the dashboard into the product shell and finish acceptance

**Files:**
- Modify: `components/ZecPulseDashboard.tsx`
- Modify: `app/globals.css` only if a dashboard navigation affordance needs existing global styling
- Modify: `README.md`

**Interfaces:**
- Dashboard telemetry behavior stays unchanged.
- Add only a lightweight home/navigation affordance linking `/dashboard` back to `/`.

- [ ] **Step 1: Add the dashboard navigation affordance**

Add a compact `<a href="/">ZecPulse</a>` / `Back to home` affordance near the existing dashboard hero without altering dashboard polling or data cards. Ensure it remains usable at mobile width.

- [ ] **Step 2: Update README product structure**

Document:

```text
/            Product landing page with cached live mainnet teaser
/dashboard   Full live Zcash network observatory
/api/zcash/snapshot   Server-side normalized snapshot endpoint
```

Mention that both UI surfaces consume the same cached endpoint and credentials remain server-side. Keep the five RPC methods clearly documented for challenge scoring.

- [ ] **Step 3: Run the full automated verification**

Run:

```bash
npm run lint
npm test
npm run build
git status --short
```

Expected:
- lint PASS
- all old + new tests PASS
- production build PASS
- only intentional source changes present before commit.

- [ ] **Step 4: Perform manual responsive acceptance**

Run:

```bash
npm run dev
```

Check `/` and `/dashboard` at:
- wide desktop (~1440px)
- tablet (~768px)
- mobile 375px
- mobile 430px

Acceptance criteria:
- no horizontal page overflow
- hero copy and both CTAs remain readable/tappable
- live metrics are legible 2×2 on mobile
- live landing values populate from mainnet
- unavailable-data state preserves the rest of the landing page
- privacy pool legend fits without clipping
- keyboard focus is visible
- `/dashboard` remains fully usable and receives live data
- no API key appears in browser-rendered HTML or `/api/zcash/snapshot` JSON.

- [ ] **Step 5: Commit final integration**

```bash
git add components/ZecPulseDashboard.tsx app/globals.css README.md
git commit -m "docs: finish ZecPulse product integration"
```

- [ ] **Step 6: Push and open the review PR**

```bash
git push -u origin feat/landing-page-v2
```

Open a PR from `feat/landing-page-v2` to `main` summarizing the landing/dashboard split, mobile acceptance, live-data reuse, and verification results. Do not merge until the final live browser acceptance is confirmed.
