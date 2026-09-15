import Link from "next/link";

export function LandingPage() {
  return (
    <main>
      <section aria-labelledby="zecpulse-title">
        <p>Zcash network observatory</p>
        <h1 id="zecpulse-title">ZecPulse</h1>
        <p>Live Zcash mainnet intelligence for blocks, peers, mempool activity, network health, and privacy pools.</p>
        <Link href="/dashboard">Open Live Dashboard</Link>
      </section>
    </main>
  );
}
