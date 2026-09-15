import Link from "next/link";
import styles from "./LandingPage.module.css";

export function SiteHeader({ isLive }: { isLive: boolean }) {
  return (
    <header className={styles.siteHeader}>
      <Link className={styles.brand} href="/" aria-label="ZecLens home">
        <span className={styles.brandMark} aria-hidden="true">Z</span>
        <span>ZecLens</span>
      </Link>

      <nav className={styles.desktopNav} aria-label="Primary navigation">
        <a href="#live-network">Live Network</a>
        <a href="#how-it-works">How it works</a>
        <a href="#rpc-stack">RPC Stack</a>
      </nav>

      <div className={styles.headerActions}>
        <span className={styles.networkStatus}>
          <span className={`${styles.liveDot} ${isLive ? styles.liveDotOn : ""}`} aria-hidden="true" />
          Zcash Mainnet
        </span>
        <Link className={styles.headerCta} href="/dashboard">
          Open Dashboard <span aria-hidden="true">→</span>
        </Link>
      </div>

      <details className={styles.mobileMenu}>
        <summary className={styles.menuSummary} aria-label="Open navigation menu">
          <span aria-hidden="true">☰</span>
        </summary>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          <a href="#live-network">Live Network</a>
          <a href="#how-it-works">How it works</a>
          <a href="#rpc-stack">RPC Stack</a>
          <Link href="/dashboard">Open Dashboard</Link>
        </nav>
      </details>
    </header>
  );
}
