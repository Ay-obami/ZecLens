import { poolPercent } from "@/lib/landing-metrics";
import type { PoolId, ZecSnapshot } from "@/lib/types";
import styles from "./LandingPage.module.css";

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
  const shielded = snapshot?.privacy.shieldedPercent ?? 0;

  return (
    <section className={`${styles.section} ${styles.privacySection}`} aria-labelledby="privacy-pools-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Privacy pools</p>
          <h2 id="privacy-pools-title">See where ZEC lives.</h2>
        </div>
        <p>Zcash supports transparent and shielded value flows. ZecLens makes that distribution visible as the network changes.</p>
      </div>

      <div className={styles.privacyLayout}>
        <div className={styles.donutPanel}>
          <div
            className={styles.privacyDonut}
            style={{
              background: `conic-gradient(var(--gold) 0 ${shielded}%, rgba(218, 226, 222, 0.18) ${shielded}% 100%)`,
            }}
            aria-label={snapshot ? `${shielded.toFixed(1)} percent of chain supply is shielded` : "Shielded supply unavailable"}
          >
            <div>
              <strong>{snapshot ? `${shielded.toFixed(1)}%` : "—"}</strong>
              <span>{unavailable ? "Live data unavailable" : "shielded"}</span>
            </div>
          </div>
          <div className={styles.privacyStatement}>
            <span className={styles.privacyGlyph} aria-hidden="true">◈</span>
            <div>
              <h3>Privacy by design.</h3>
              <p>ZecLens makes Zcash&apos;s mix of transparent, shielded, and locked value easier to understand at a glance.</p>
            </div>
          </div>
        </div>

        <ul className={styles.poolLegend}>
          {poolOrder.map(({ id, label, kind }) => {
            const pool = pools.get(id);
            const percent = snapshot && pool
              ? poolPercent(pool.zec, snapshot.chain.supply)
              : 0;

            return (
              <li key={id}>
                <div className={styles.poolTitleRow}>
                  <div>
                    <strong>{label}</strong>
                    <span>{kind}</span>
                  </div>
                  <div className={styles.poolNumbers}>
                    <strong>{pool ? `${formatZec(pool.zec)} ZEC` : "—"}</strong>
                    <span>{pool ? `${percent.toFixed(2)}%` : "—"}</span>
                  </div>
                </div>
                <div className={styles.poolTrack} aria-hidden="true">
                  <span style={{ width: pool ? `${Math.max(percent, 0.5)}%` : "0%" }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className={styles.privacyNote}>Shielded total includes Sprout, Sapling, Orchard, and Ironwood. Lockbox is shown separately.</p>
    </section>
  );
}
