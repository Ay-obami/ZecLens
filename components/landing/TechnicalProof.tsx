import styles from "./LandingPage.module.css";

const methods = [
  "getblockchaininfo",
  "getnetworkinfo",
  "getmempoolinfo",
  "getbestblockhash",
  "getblock",
];

export function TechnicalProof() {
  return (
    <section id="rpc-stack" className={`${styles.section} ${styles.technicalProof}`} aria-labelledby="rpc-title">
      <div>
        <p className={styles.eyebrow}>RPC stack</p>
        <h2 id="rpc-title">Five live methods. One clear pulse.</h2>
        <p className={styles.technicalCopy}>
          Every ZecPulse snapshot is assembled from live Zcash node data and normalized into a stable view for the interface.
        </p>
      </div>
      <div className={styles.methodList} aria-label="Live Zcash RPC methods">
        {methods.map((method) => (
          <code key={method}>{method}</code>
        ))}
      </div>
    </section>
  );
}
