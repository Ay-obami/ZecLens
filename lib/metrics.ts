import type { ValuePool } from "./types";

const SHIELDED_IDS = new Set(["sprout", "sapling", "orchard", "ironwood"]);

export function calculatePrivacy(pools: ValuePool[], chainSupply: number) {
  const shieldedZec = pools
    .filter((pool) => SHIELDED_IDS.has(pool.id))
    .reduce((sum, pool) => sum + pool.zec, 0);

  return {
    shieldedZec,
    shieldedPercent: chainSupply > 0 ? (shieldedZec / chainSupply) * 100 : 0,
  };
}

export function normalizeSyncPercent(progress: number) {
  return Math.min(100, Math.max(0, progress * 100));
}

export function getMempoolActivity(count: number): "Quiet" | "Active" | "Busy" {
  if (count === 0) return "Quiet";
  if (count < 25) return "Active";
  return "Busy";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
