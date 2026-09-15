import Link from "next/link";
import type { ZecSnapshot } from "@/lib/types";

interface HeroSectionProps {
  snapshot: ZecSnapshot | null;
  isLive: boolean;
  isLoading: boolean;
}

export function HeroSection({ snapshot, isLive, isLoading }: HeroSectionProps) {
  const statusLabel = isLoading
    ? "Connecting"
    : isLive
      ? "Live"
      : snapshot
        ? "Last snapshot"
        : "Unavailable";

  return (
    <section aria-labelledby="landing-title">
      <div>
        <p>Real data. A clearer view of Zcash.</p>
        <h1 id="landing-title">See Zcash move in real time.</h1>
        <p>
          Live network intelligence that turns raw Zcash mainnet data into a
          clear view of blocks, peers, mempool activity, network health, and
          privacy.
        </p>
        <div>
          <Link href="/dashboard">Open Live Dashboard</Link>
          <a href="#rpc-stack">Explore the RPC Stack</a>
        </div>
        <ul aria-label="ZecPulse highlights">
          <li>Live Zcash Mainnet</li>
          <li>Zebra RPC data</li>
          <li>Mini Build Challenge</li>
        </ul>
      </div>

      <div aria-label="Live Zcash network preview">
        <div>
          <span>Latest Block</span>
          <strong>{snapshot ? `#${snapshot.chain.height.toLocaleString()}` : "—"}</strong>
        </div>
        <div>
          <span>Network Status</span>
          <strong>{statusLabel}</strong>
        </div>
        <div>
          <span>Peers</span>
          <strong>{snapshot ? snapshot.node.connections.toLocaleString() : "—"}</strong>
        </div>
        <div>
          <span>Mempool</span>
          <strong>{snapshot ? `${snapshot.mempool.count.toLocaleString()} tx` : "—"}</strong>
        </div>
      </div>
    </section>
  );
}
