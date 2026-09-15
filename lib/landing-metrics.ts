export function formatFreshness(updatedAt: string, nowMs = Date.now()): string {
  const updatedMs = Date.parse(updatedAt);
  const elapsedMs = Number.isFinite(updatedMs) ? Math.max(0, nowMs - updatedMs) : 0;
  const seconds = Math.floor(elapsedMs / 1_000);

  if (seconds < 60) {
    return `Updated ${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  return `Updated ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
}

export function poolPercent(zec: number, chainSupply: number): number {
  if (!Number.isFinite(zec) || !Number.isFinite(chainSupply) || chainSupply <= 0) {
    return 0;
  }

  return (zec / chainSupply) * 100;
}
