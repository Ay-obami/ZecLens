import { poolPercent } from "@/lib/landing-metrics";
import type { PoolId, ZecSnapshot } from "@/lib/types";

interface PrivacyOverviewProps {
  snapshot: ZecSnapshot | null;
  isLoading: boolean;
}

const poolOrder: Array<{ id: PoolId; label: string; kind: string }> = [
  { id: "transparent", label: "Transparent", kind: "Public" },
  { id: "sprout", label: "Sprout", kind: "Shielded" },
  { id: "sapling", label: "Sapling", kind: "Shielded" },
  { id: "orchard", label: "Orchard", kind: "Shielded" },
  { id: "lockbox", label: "Lockbox", kind: "Locked" },
  { id: "ironwood", label: "Ironwood", kind: "Shielded" },
];

function formatZec(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function PrivacyOverview({ snapshot, isLoading }: PrivacyOverviewProps) {
  const pools = new Map(snapshot?.pools.map((pool) => [pool.id, pool]) ?? []);
  const unavailable = !snapshot && !isLoading;

  return (
    <section aria-labelledby="privacy-pools-title">
      <div>
        <p>Privacy pools</p>
        <h2 id="privacy-pools-title">See where ZEC lives.</h2>
        <p>
          Zcash gives users a choice between transparent and shielded value
          flows. ZecPulse makes that distribution visible in real time.
        </p>
      </div>

      <div>
        <div aria-label="Shielded share of Zcash chain supply">
          <strong>
            {snapshot ? `${snapshot.privacy.shieldedPercent.toFixed(1)}%` : "—"}
          </strong>
          <span>{unavailable ? "Live data unavailable" : "shielded"}</span>
        </div>

        <ul>
          {poolOrder.map(({ id, label, kind }) => {
            const pool = pools.get(id);
            const percent = snapshot && pool
              ? poolPercent(pool.zec, snapshot.chain.supply)
              : 0;

            return (
              <li key={id}>
                <div>
                  <strong>{label}</strong>
                  <span>{kind}</span>
                </div>
                <div>
                  <span>{pool ? `${formatZec(pool.zec)} ZEC` : "—"}</span>
                  <span>{pool ? `${percent.toFixed(2)}%` : "—"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p>
        Shielded total includes Sprout, Sapling, Orchard, and Ironwood.
        Lockbox is shown separately.
      </p>
    </section>
  );
}
