import Link from "next/link";
import styles from "./LandingPage.module.css";

export function FinalCta() {
  return (
    <section className={styles.finalCta} aria-labelledby="final-cta-title">
      <div>
        <p className={styles.eyebrow}>Live network observatory</p>
        <h2 id="final-cta-title">The Zcash network is live. Watch it move.</h2>
        <p>Open the full observatory for block, network, mempool, privacy, and latest-block telemetry.</p>
      </div>
      <Link className={styles.primaryButton} href="/dashboard">
        Launch Network Observatory <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
