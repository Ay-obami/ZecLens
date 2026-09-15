import Link from "next/link";
import styles from "./LandingPage.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <Link className={styles.footerBrand} href="/">
        <span className={styles.footerMark} aria-hidden="true">Z</span>
        ZecLens
      </Link>
      <p>Built for the Zcash Mini Build Challenge · Live Zcash data via Zebra RPC</p>
      <a
        href="https://github.com/Ay-obami/ZecLens"
        target="_blank"
        rel="noreferrer"
      >
        GitHub <span aria-hidden="true">↗</span>
      </a>
    </footer>
  );
}
