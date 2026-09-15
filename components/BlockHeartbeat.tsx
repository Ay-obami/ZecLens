import { formatBytes } from "@/lib/metrics";
import type { ZecSnapshot } from "@/lib/types";

function shortenHash(hash: string) {
  return hash.length > 24 ? `${hash.slice(0, 12)}…${hash.slice(-10)}` : hash;
}

function relativeAge(unixSeconds: number) {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function BlockHeartbeat({
  block,
  chain,
  pulse,
  updatedAt,
}: {
  block: ZecSnapshot["block"];
  chain: ZecSnapshot["chain"];
  pulse: boolean;
  updatedAt: string;
}) {
  const tipGap = Math.max(0, chain.estimatedHeight - block.height);

  return (
    <section
      className={`card block-card${pulse ? " is-pulsing" : ""}`}
      aria-labelledby="block-title"
    >
      <div className="card-heading">
        <div>
          <p className="eyebrow">Block heartbeat</p>
          <h2 id="block-title">#{block.height.toLocaleString()}</h2>
        </div>
        <span className={`status-badge${tipGap <= 2 ? " is-good" : ""}`}>
          {tipGap <= 2 ? "At chain tip" : `${tipGap} blocks behind`}
        </span>
      </div>

      <div className="heartbeat-line" aria-hidden="true">
        <span />
        <i />
        <span />
      </div>

      <dl className="metric-list">
        <div>
          <dt>Latest hash</dt>
          <dd className="hash" title={block.hash}>
            {shortenHash(block.hash)}
          </dd>
        </div>
        <div>
          <dt>Block age</dt>
          <dd>{relativeAge(block.time)}</dd>
        </div>
        <div>
          <dt>Transactions</dt>
          <dd>{block.transactions.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Block size</dt>
          <dd>{formatBytes(block.size)}</dd>
        </div>
      </dl>

      <p className="updated-at">
        Snapshot {new Date(updatedAt).toLocaleTimeString()}
      </p>
    </section>
  );
}
