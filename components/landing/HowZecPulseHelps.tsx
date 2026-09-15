import styles from "./LandingPage.module.css";

const benefits = [
  {
    symbol: "▥",
    title: "Live Network Insights",
    copy: "Get a real-time pulse on blocks, peers, mempool activity, and privacy flows without reading raw node responses.",
  },
  {
    symbol: "◎",
    title: "A More Informed Community",
    copy: "Make Zcash activity, health, and network trends easier to understand for builders and curious users alike.",
  },
  {
    symbol: "◇",
    title: "A More Private Future",
    copy: "Visualize how value moves across Zcash's privacy pools and make the network's privacy story easier to see.",
  },
];

export function HowZecPulseHelps() {
  return (
    <section className={styles.section} aria-labelledby="helps-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>How ZecPulse helps</p>
          <h2 id="helps-title">Turn network data into clarity.</h2>
        </div>
        <p>A focused observatory for understanding what Zcash is doing right now.</p>
      </div>

      <div className={styles.benefitGrid}>
        {benefits.map((benefit) => (
          <article className={styles.benefitCard} key={benefit.title}>
            <span className={styles.benefitIcon} aria-hidden="true">{benefit.symbol}</span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
