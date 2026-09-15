# ZecPulse Landing Page V2 — Design Specification

## Goal

Upgrade ZecPulse from a single dashboard screen into a polished, product-like experience suitable for a hackathon judge or public visitor. The landing page must communicate what ZecPulse is, prove that it is reading live Zcash mainnet data, and funnel users into the full dashboard without adding unnecessary product scope.

## Product Structure

- `/` becomes the public landing page.
- `/dashboard` becomes the full existing live Zcash observatory.
- `/api/zcash/snapshot` remains the single data source for both surfaces.
- No wallet, authentication, database, or additional backend system is introduced.

The landing page is a presentation and discovery layer over the already-working live telemetry system.

## Positioning

ZecPulse should feel like a premium network observatory rather than a generic crypto dashboard or hackathon demo.

Primary positioning:

> See Zcash move in real time.

Supporting copy should explain that ZecPulse turns raw live network data into a readable view of blocks, peers, mempool activity, network health, and privacy-pool distribution.

The page should lead with the product benefit and then reveal technical credibility. It should not over-emphasize infrastructure providers or include a dedicated third-party architecture showcase.

## Visual Direction

Use a premium dark-and-gold Zcash-inspired visual system:

- near-black and charcoal backgrounds
- warm gold accents
- thin technical grid lines
- soft radial glows
- restrained glass-like telemetry cards
- strong editorial typography
- subtle, purposeful live-status motion
- rounded panels with thin borders

The visual treatment should feel sophisticated and technical, not cyberpunk-heavy.

## Information Architecture

### 1. Navigation

Desktop navigation:

- ZecPulse brand
- Live Network
- How it works
- RPC Stack
- Open Dashboard CTA

Mobile navigation:

- ZecPulse brand
- compact menu trigger
- Open Dashboard remains easy to access

### 2. Hero

Desktop uses a two-column composition.

Left side:

- eyebrow: real/live Zcash network framing
- headline: `See Zcash move in real time.`
- concise supporting copy
- primary CTA: `Open Live Dashboard`
- secondary CTA: `Explore the RPC Stack`
- credibility chips such as live mainnet, Zebra RPC, and challenge build

Right side:

- premium live telemetry composition
- latest block
- network health
- peer count
- mempool count
- restrained visual treatment that suggests network movement without relying on a third-party logo wall

Mobile stacks the hero copy and telemetry vertically.

### 3. Live Now

Immediately below the hero, show four compact real-time metrics sourced from `/api/zcash/snapshot`:

- block height
- Zebra version
- peer count
- mempool transaction count

Display a freshness indicator such as `Updated 12 seconds ago`.

If live data is temporarily unavailable, the landing page must remain usable and show a graceful unavailable state rather than collapsing the page.

### 4. What ZecPulse Reveals

Three product-value cards:

#### Block Heartbeat
Track the latest blocks, block times, transaction count, and network rhythm.

#### Network Health
Show node version, peer connections, chain state, synchronization, and network stability at a glance.

#### Privacy Pulse
Show how ZEC is distributed across transparent and shielded pools.

These cards should explain value, not merely repeat RPC method names.

### 5. Privacy Pools

A visually strong privacy section should show:

- shielded percentage
- transparent pool
- Sprout
- Sapling
- Orchard
- Ironwood
- Lockbox as a separate locked category

Shielded total continues to include only Sprout, Sapling, Orchard, and Ironwood. Transparent and Lockbox are excluded from the shielded total.

Use live values when available.

A concise copy panel should explain that Zcash gives users a choice between transparent and shielded value flows, and ZecPulse makes that distribution visible.

### 6. How ZecPulse Helps

Replace the previously proposed `Built directly on Zebra RPC` promotional architecture section with a product-oriented section that does not advertise unrelated providers.

Three concise cards:

- Live Network Insights
- A More Informed Community
- A More Private Future

The technical implementation can still be mentioned in supporting copy and the README, but the public landing page should not display provider-chain diagrams or promote external infrastructure brands.

### 7. Technical Proof

The hybrid product/developer positioning still needs technical credibility for judges.

Include a compact, brand-neutral technical proof area or RPC stack disclosure that lists the five live methods without turning the section into a provider advertisement:

- `getblockchaininfo`
- `getnetworkinfo`
- `getmempoolinfo`
- `getbestblockhash`
- `getblock`

This may appear as a compact expandable block, technical strip, or supporting section. It should remain visually subordinate to the product story.

### 8. Final CTA

Strong close:

> The Zcash network is live. Watch it move.

Primary CTA:

- `Launch Network Observatory`

### 9. Footer

Keep the footer compact and product-focused:

- ZecPulse
- built for the Zcash Mini Build Challenge
- powered by live Zcash/Zebra RPC data
- GitHub link

Avoid unnecessary third-party promotional references.

## Dashboard Route

Move the existing `ZecPulseDashboard` experience from `/` to `/dashboard` with minimal functional change.

The dashboard should retain:

- 10-second browser polling
- 15-second server-side cache
- new-block pulse
- stale-data retention
- retry behavior
- block heartbeat
- network health
- mempool pulse
- privacy pulse
- latest block impact

The dashboard may receive a small top navigation/back-to-home affordance so the two surfaces feel like one product.

## Shared Live Data

Create a small reusable client-side snapshot hook or landing-specific data component around the existing `/api/zcash/snapshot` endpoint rather than duplicating RPC logic.

Requirements:

- browser only talks to `/api/zcash/snapshot`
- API credentials remain server-only
- reuse the existing cached server snapshot
- landing page polling should not increase provider load beyond what the current cache protects
- landing page may poll at the same or lower frequency than the dashboard

## Responsive Design

Mobile is a first-class target.

### Desktop ≥ 1024px

- two-column hero
- four live metrics in one row
- three capability cards in one row
- wide privacy composition
- horizontal CTA/footer layouts

### Tablet 640–1023px

- simplified hero composition
- 2×2 live metrics
- flexible two-column card layout
- reduced decorative density

### Mobile < 640px

- single-column narrative
- hero copy first, telemetry immediately after
- full-width or stacked CTA buttons
- 2×2 compact live metrics
- feature cards stacked vertically
- privacy visualization and legend stacked
- technical method list wraps or scrolls safely
- large touch targets
- no hover-dependent interactions
- no horizontal page overflow

Typography should scale fluidly rather than use abrupt breakpoint jumps.

Target ranges:

- hero: ~64–72px desktop, ~38–44px mobile
- section headings: ~38–44px desktop, ~28–32px mobile
- body: ~17–18px desktop, ~15–16px mobile

## Motion and Accessibility

- subtle live-status pulse
- optional gentle telemetry transitions
- restrained decorative motion only
- preserve `prefers-reduced-motion`
- maintain readable contrast
- semantic headings and landmarks
- focus-visible styles for navigation and CTAs
- all key navigation accessible by keyboard

## Error Handling

Landing page live data must fail gracefully.

If snapshot data is unavailable:

- keep the hero, features, privacy explanation, and CTAs visible
- show `Live data temporarily unavailable` in metric areas
- avoid a full-page error state
- provide a retry action where useful

Dashboard retains the existing full loading/error/stale-data behavior.

## Components

Expected component boundaries:

- `LandingPage`
- `SiteHeader`
- `HeroSection`
- `LiveMetricsStrip`
- `FeatureGrid`
- `PrivacyOverview`
- `TechnicalProof`
- `HowZecPulseHelps`
- `FinalCta`
- `SiteFooter`
- reusable snapshot polling hook or data helper

Existing dashboard components remain isolated and reusable.

## Routing Changes

- `app/page.tsx` renders the landing page
- `app/dashboard/page.tsx` renders `ZecPulseDashboard`
- existing `/api/zcash/snapshot` remains unchanged unless a tiny response-level adjustment is necessary

## Testing

Add focused tests for the new structure where practical:

- landing page renders core product copy and CTA links
- `/dashboard` continues to render the observatory
- live metric component handles successful snapshot data
- live metric component handles unavailable data gracefully
- any shared data helper preserves the existing polling/error behavior

Existing 13 tests must continue to pass.

Final verification:

```bash
npm run lint
npm test
npm run build
```

Manual responsive acceptance:

- desktop wide view
- tablet width
- mobile width around 375–430px
- no horizontal overflow
- hero and CTAs remain readable
- live metrics remain legible
- dashboard remains fully usable on mobile

## Out of Scope

Do not add:

- wallet connection
- user accounts
- authentication
- database
- historical analytics backend
- charts requiring new data sources
- additional third-party protocol promotion
- new RPC methods solely for visual decoration

The goal is to make the existing technically strong build feel complete, intentional, and judge-ready without bloating scope.
