import type { ValuePool, ZecSnapshot } from "@/lib/types";

const SHIELDED_IDS = new Set(["sprout", "sapling", "orchard", "ironwood"]);

const zecFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function poolLabel(id: string) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function poolKind(id: string) {
  if (SHIELDED_IDS.has(id)) return "Shielded";
  if (id === "lockbox") return "Locked";
  if (id === "transparent") return "Public";
  return "Pool";
}

export function PrivacyPulse({
  chainSupply,
  pools,
  privacy,
}: {
  chainSupply: number;
  pools: ValuePool[];
  privacy: ZecSnapshot["privacy"];
}) {
  return (
    <section className="card privacy-card" aria-labelledby="privacy-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Privacy pulse</p>
          <h2 id="privacy-title">Where ZEC lives</h2>
        </div>
        <span className="status-badge privacy-badge">Live supply</span>
      </div>

      <div className="privacy-summary">
        <div>
          <strong>{zecFormatter.format(privacy.shieldedZec)}</strong>
          <span>shielded ZEC</span>
        </div>
        <div>
          <strong>{privacy.shieldedPercent.toFixed(2)}%</strong>
          <span>of chain supply</span>
        </div>
      </div>

      <div className="pool-list">
        {pools.map((pool) => {
          const percent = chainSupply > 0 ? (pool.zec / chainSupply) * 100 : 0;
          return (
            <div className="pool-row" key={pool.id}>
              <div className="pool-meta">
                <div>
                  <strong>{poolLabel(pool.id)}</strong>
                  <span>{poolKind(pool.id)}</span>
                </div>
                <div className="pool-value">
                  <strong>{zecFormatter.format(pool.zec)} ZEC</strong>
                  <span>{percent.toFixed(2)}%</span>
                </div>
              </div>
              <div className="pool-track" aria-hidden="true">
                <span
                  className={`pool-fill pool-${pool.id}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, percent))}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="helper-text">
        Shielded total includes Sprout, Sapling, Orchard and Ironwood. Lockbox
        is shown separately.
      </p>
    </section>
  );
}
