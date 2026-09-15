import { formatFreshness } from "@/lib/landing-metrics";
import type { ZecSnapshot } from "@/lib/types";
import styles from "./LandingPage.module.css";

interface LiveMetricsStripProps {
  snapshot: ZecSnapshot | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

function zebraVersion(version: string): string {
  const match = version.match(/Zebra:([^/]+)/i);
  return match?.[1] ?? version.replaceAll("/", "");
}

export function LiveMetricsStrip({
  snapshot,
  error,
  isLoading,
  onRetry,
}: LiveMetricsStripProps) {
  const unavailable = !snapshot && !isLoading;
  const fallback = unavailable ? "Live data temporarily unavailable" : "—";

  const metrics = [
    {
      icon: "▣",
      label: "Block Height",
      value: snapshot ? snapshot.chain.height.toLocaleString() : fallback,
    },
    {
      icon: "≋",
      label: "Zebra Version",
      value: snapshot ? zebraVersion(snapshot.node.version) : fallback,
    },
    {
      icon: "◎",
      label: "Peers",
      value: snapshot ? snapshot.node.connections.toLocaleString() : fallback,
    },
    {
      icon: "▤",
      label: "Mempool",
      value: snapshot ? `${snapshot.mempool.count.toLocaleString()} tx` : fallback,
    },
  ];

  return (
    <section id="live-network" className={`${styles.section} ${styles.liveSection}`} aria-labelledby="live-network-title">
      <div className={styles.liveHeading}>
        <div>
          <p className={styles.eyebrow}>Live now</p>
          <h2 id="live-network-title">Zcash mainnet, at a glance.</h2>
        </div>
        <div className={styles.freshness} aria-live="polite">
          <span className={`${styles.liveDot} ${snapshot && !error ? styles.liveDotOn : ""}`} aria-hidden="true" />
          {snapshot
            ? formatFreshness(snapshot.updatedAt)
            : isLoading
              ? "Connecting to Zcash mainnet…"
              : "Live data temporarily unavailable"}
        </div>
      </div>

      <dl className={styles.liveMetrics}>
        {metrics.map((metric) => (
          <div className={styles.liveMetric} key={metric.label}>
            <span className={styles.metricIcon} aria-hidden="true">{metric.icon}</span>
            <div>
              <dt>{metric.label}</dt>
              <dd
                style={unavailable ? { whiteSpace: "normal", fontSize: "0.76rem", lineHeight: 1.35 } : undefined}
              >
                {metric.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {error ? (
        <div className={styles.liveError} role="status">
          <span>
            {snapshot
              ? "Live refresh interrupted. Showing the last successful snapshot."
              : "Live data temporarily unavailable."}
          </span>
          <button type="button" onClick={onRetry}>Retry</button>
        </div>
      ) : null}
    </section>
  );
}
