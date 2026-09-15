import { formatFreshness } from "@/lib/landing-metrics";
import type { ZecSnapshot } from "@/lib/types";

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
      label: "Block Height",
      value: snapshot ? snapshot.chain.height.toLocaleString() : fallback,
    },
    {
      label: "Zebra Version",
      value: snapshot ? zebraVersion(snapshot.node.version) : fallback,
    },
    {
      label: "Peers",
      value: snapshot ? snapshot.node.connections.toLocaleString() : fallback,
    },
    {
      label: "Mempool",
      value: snapshot ? `${snapshot.mempool.count.toLocaleString()} tx` : fallback,
    },
  ];

  return (
    <section id="live-network" aria-labelledby="live-network-title">
      <div>
        <div>
          <p>Live now</p>
          <h2 id="live-network-title">Zcash mainnet, at a glance.</h2>
        </div>
        <div aria-live="polite">
          {snapshot
            ? formatFreshness(snapshot.updatedAt)
            : isLoading
              ? "Connecting to Zcash mainnet…"
              : "Live data temporarily unavailable"}
        </div>
      </div>

      <dl>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>

      {error ? (
        <div role="status">
          <span>
            {snapshot
              ? "Live refresh interrupted. Showing the last successful snapshot."
              : "Live data temporarily unavailable."}
          </span>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}
    </section>
  );
}
