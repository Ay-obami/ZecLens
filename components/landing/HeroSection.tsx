import Link from "next/link";
import type { ZecSnapshot } from "@/lib/types";
import styles from "./LandingPage.module.css";

interface HeroSectionProps {
  snapshot: ZecSnapshot | null;
  isLive: boolean;
  isLoading: boolean;
}

export function HeroSection({ snapshot, isLive, isLoading }: HeroSectionProps) {
  const statusLabel = isLoading
    ? "Connecting"
    : isLive
      ? "Healthy"
      : snapshot
        ? "Last snapshot"
        : "Unavailable";

  return (
    <section className={styles.heroSection} aria-labelledby="landing-title">
      <div className={styles.heroCopy}>
        <p className={styles.heroEyebrow}>Real data. A clearer view of Zcash.</p>
        <h1 id="landing-title">
          See Zcash move <span>in real time.</span>
        </h1>
        <p className={styles.heroLead}>
          Live network intelligence that turns raw Zcash mainnet data into a
          clear view of blocks, peers, mempool activity, network health, and
          privacy.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.primaryButton} href="/dashboard">
            Open Live Dashboard <span aria-hidden="true">→</span>
          </Link>
          <a className={styles.secondaryButton} href="#rpc-stack">
            Explore the RPC Stack
          </a>
        </div>
        <ul className={styles.heroChips} aria-label="ZecPulse highlights">
          <li><span aria-hidden="true">●</span> Live Zcash Mainnet</li>
          <li><span aria-hidden="true">◆</span> Zebra RPC data</li>
          <li><span aria-hidden="true">✦</span> Mini Build Challenge</li>
        </ul>
      </div>

      <div className={styles.heroVisual} aria-label="Live Zcash network preview">
        <div className={styles.orbit} aria-hidden="true">
          <div className={styles.orbitInner}>
            <span>Z</span>
          </div>
        </div>
        <div className={styles.heroTelemetry}>
          <div className={styles.telemetryRow}>
            <span>Latest Block</span>
            <strong>{snapshot ? `#${snapshot.chain.height.toLocaleString()}` : "—"}</strong>
          </div>
          <div className={styles.telemetryRow}>
            <span>Network Status</span>
            <strong className={isLive ? styles.goodText : ""}>{statusLabel}</strong>
          </div>
          <div className={styles.telemetrySplit}>
            <div>
              <span>Peers</span>
              <strong>{snapshot ? snapshot.node.connections.toLocaleString() : "—"}</strong>
            </div>
            <div>
              <span>Mempool</span>
              <strong>{snapshot ? `${snapshot.mempool.count.toLocaleString()} tx` : "—"}</strong>
            </div>
          </div>
          <div className={styles.signalLine} aria-hidden="true">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <small>Zcash mainnet telemetry</small>
        </div>
      </div>
    </section>
  );
}
