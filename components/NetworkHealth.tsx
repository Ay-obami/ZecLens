import type { ZecSnapshot } from "@/lib/types";

export function NetworkHealth({
  chain,
  node,
}: {
  chain: ZecSnapshot["chain"];
  node: ZecSnapshot["node"];
}) {
  const connected = node.connections > 0;
  const synced = chain.syncPercent >= 99.99;

  return (
    <section className="card" aria-labelledby="network-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Network health</p>
          <h2 id="network-title">{node.version.replaceAll("/", "")}</h2>
        </div>
        <span className={`status-badge${connected && synced ? " is-good" : ""}`}>
          {connected && synced ? "Healthy" : "Syncing"}
        </span>
      </div>

      <div className="primary-metric">
        <strong>{node.connections.toLocaleString()}</strong>
        <span>peer connections</span>
      </div>

      <dl className="metric-list compact">
        <div>
          <dt>Chain</dt>
          <dd>{chain.name === "main" ? "Mainnet" : chain.name}</dd>
        </div>
        <div>
          <dt>Sync</dt>
          <dd>{chain.syncPercent.toFixed(4)}%</dd>
        </div>
        <div>
          <dt>Protocol</dt>
          <dd>{node.protocolVersion.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>
            {chain.difficulty.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </dd>
        </div>
      </dl>
    </section>
  );
}
