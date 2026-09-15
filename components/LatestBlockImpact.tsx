import type { ValuePool } from "@/lib/types";

function signedZec(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })} ZEC`;
}

export function LatestBlockImpact({ pools }: { pools: ValuePool[] }) {
  const moved = pools.filter((pool) => Math.abs(pool.delta) > Number.EPSILON);

  return (
    <section className="impact-section" aria-labelledby="impact-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Latest block impact</p>
          <h2 id="impact-title">Value-pool movement</h2>
        </div>
        <p>Changes reported by Zebra for the newest block.</p>
      </div>

      {moved.length > 0 ? (
        <div className="impact-grid">
          {moved.map((pool) => (
            <div className="impact-item" key={pool.id}>
              <span>{pool.id.charAt(0).toUpperCase() + pool.id.slice(1)}</span>
              <strong className={pool.delta >= 0 ? "positive" : "negative"}>
                {signedZec(pool.delta)}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-impact">
          No value-pool movement reported in this block.
        </p>
      )}
    </section>
  );
}
