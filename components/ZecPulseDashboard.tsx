"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchZecSnapshot } from "@/lib/client-snapshot";
import type { ZecSnapshot } from "@/lib/types";
import { BlockHeartbeat } from "./BlockHeartbeat";
import { LatestBlockImpact } from "./LatestBlockImpact";
import { MempoolPulse } from "./MempoolPulse";
import { NetworkHealth } from "./NetworkHealth";
import { PrivacyPulse } from "./PrivacyPulse";

const POLL_INTERVAL_MS = 10_000;
const BLOCK_PULSE_MS = 1_200;

export function ZecPulseDashboard() {
  const [snapshot, setSnapshot] = useState<ZecSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newBlock, setNewBlock] = useState(false);
  const previousHash = useRef<string | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSnapshot = useCallback(async () => {
    try {
      const next = await fetchZecSnapshot();

      if (previousHash.current && previousHash.current !== next.block.hash) {
        setNewBlock(true);
        if (pulseTimer.current) clearTimeout(pulseTimer.current);
        pulseTimer.current = setTimeout(() => setNewBlock(false), BLOCK_PULSE_MS);
      }

      previousHash.current = next.block.hash;
      setSnapshot(next);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Live Zcash data is unavailable.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(() => void loadSnapshot(), 0);
    const interval = setInterval(() => void loadSnapshot(), POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [loadSnapshot]);

  if (!snapshot && isLoading) {
    return (
      <main className="shell">
        <DashboardHomeLink />
        <Hero live={false} />
        <div className="dashboard-grid" aria-label="Loading live Zcash data">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="card skeleton-card" key={index} aria-hidden="true">
              <div className="skeleton skeleton-kicker" />
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="shell">
        <DashboardHomeLink />
        <Hero live={false} />
        <section className="card error-card" role="alert">
          <p className="eyebrow">Connection status</p>
          <h2>RPC unavailable</h2>
          <p>{error ?? "Live Zcash data is temporarily unavailable."}</p>
          <button
            className="retry-button"
            type="button"
            onClick={() => void loadSnapshot()}
          >
            Retry connection
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <DashboardHomeLink />
      <Hero live={!error} />

      {error ? (
        <div className="stale-warning" role="status">
          Latest refresh failed. Showing the last successful network snapshot.
          <button type="button" onClick={() => void loadSnapshot()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="dashboard-grid">
        <BlockHeartbeat
          block={snapshot.block}
          chain={snapshot.chain}
          pulse={newBlock}
          updatedAt={snapshot.updatedAt}
        />
        <NetworkHealth chain={snapshot.chain} node={snapshot.node} />
        <MempoolPulse mempool={snapshot.mempool} />
        <PrivacyPulse
          chainSupply={snapshot.chain.supply}
          pools={snapshot.pools}
          privacy={snapshot.privacy}
        />
      </div>

      <LatestBlockImpact pools={snapshot.pools} />

      <footer className="site-footer">
        <span>Five live Zebra RPC methods</span>
        <span aria-hidden="true">·</span>
        <span>Refreshes every 10 seconds</span>
        <span aria-hidden="true">·</span>
        <span>Live Zcash mainnet</span>
      </footer>
    </main>
  );
}

function DashboardHomeLink() {
  return (
    <Link
      href="/"
      className="status-badge"
      style={{ marginBottom: 18, textDecoration: "none" }}
    >
      <span aria-hidden="true">←</span> Back to ZecPulse
    </Link>
  );
}

function Hero({ live }: { live: boolean }) {
  return (
    <header className="hero">
      <div>
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            Z
          </div>
          <div>
            <p className="eyebrow">Zcash network observatory</p>
            <h1>ZecPulse</h1>
          </div>
        </div>
        <p className="hero-copy">
          A live mainnet pulse built directly from Zebra JSON-RPC data.
        </p>
      </div>
      <div
        className="hero-status"
        aria-label={
          live ? "Live Zcash mainnet data" : "Connecting to Zcash mainnet"
        }
      >
        <span className={`live-dot${live ? " is-live" : ""}`} aria-hidden="true" />
        <div>
          <strong>Zcash Mainnet — {live ? "Live" : "Connecting"}</strong>
          <span>Powered by Zebra RPC</span>
        </div>
      </div>
    </header>
  );
}
