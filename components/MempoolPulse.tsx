import { formatBytes } from "@/lib/metrics";
import type { ZecSnapshot } from "@/lib/types";

export function MempoolPulse({
  mempool,
}: {
  mempool: ZecSnapshot["mempool"];
}) {
  return (
    <section className="card" aria-labelledby="mempool-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Mempool pulse</p>
          <h2 id="mempool-title">Unconfirmed activity</h2>
        </div>
        <span
          className={`status-badge activity-${mempool.activity.toLowerCase()}`}
        >
          {mempool.activity}
        </span>
      </div>

      <div className="primary-metric">
        <strong>{mempool.count.toLocaleString()}</strong>
        <span>transactions waiting</span>
      </div>

      <dl className="metric-list compact">
        <div>
          <dt>Serialized bytes</dt>
          <dd>{formatBytes(mempool.bytes)}</dd>
        </div>
        <div>
          <dt>Memory usage</dt>
          <dd>{formatBytes(mempool.usage)}</dd>
        </div>
      </dl>
      <p className="helper-text">
        Activity labels are derived locally from the live transaction count.
      </p>
    </section>
  );
}
