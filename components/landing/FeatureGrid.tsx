import Link from "next/link";
import styles from "./LandingPage.module.css";

const features = [
  {
    number: "01",
    title: "Block Heartbeat",
    copy: "Track the newest blocks, block age, transaction activity, and the network's rhythm in real time.",
    link: "See chain activity",
  },
  {
    number: "02",
    title: "Network Health",
    copy: "Read node version, peer connections, synchronization, and chain state without digging through raw RPC output.",
    link: "Check network status",
  },
  {
    number: "03",
    title: "Privacy Pulse",
    copy: "See how ZEC is distributed across transparent, shielded, and locked value pools as the network changes.",
    link: "Explore privacy metrics",
  },
];

export function FeatureGrid() {
  return (
    <section id="how-it-works" className={styles.section} aria-labelledby="reveals-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>What ZecPulse reveals</p>
          <h2 id="reveals-title">Network signal without the noise.</h2>
        </div>
        <p>From blocks to privacy pools, ZecPulse turns live node data into a readable picture of the network.</p>
      </div>

      <div className={styles.cardGrid}>
        {features.map((feature) => (
          <article className={styles.featureCard} key={feature.title}>
            <span className={styles.cardNumber} aria-hidden="true">{feature.number}</span>
            <h3>{feature.title}</h3>
            <p>{feature.copy}</p>
            <Link href="/dashboard">{feature.link} <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
