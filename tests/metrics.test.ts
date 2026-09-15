import { describe, expect, it } from "vitest";
import {
  calculatePrivacy,
  formatBytes,
  getMempoolActivity,
  normalizeSyncPercent,
} from "@/lib/metrics";

const pools = [
  { id: "transparent", zec: 100, delta: 0 },
  { id: "sprout", zec: 10, delta: 0 },
  { id: "sapling", zec: 20, delta: 0 },
  { id: "orchard", zec: 30, delta: 0 },
  { id: "ironwood", zec: 40, delta: 0 },
  { id: "lockbox", zec: 50, delta: 0 },
];

describe("calculatePrivacy", () => {
  it("counts only shielded pools and excludes transparent and lockbox", () => {
    expect(calculatePrivacy(pools, 250)).toEqual({
      shieldedZec: 100,
      shieldedPercent: 40,
    });
  });
});

describe("normalizeSyncPercent", () => {
  it("converts a fraction to a clamped percentage", () => {
    expect(normalizeSyncPercent(0.999999)).toBeCloseTo(99.9999, 4);
    expect(normalizeSyncPercent(1.2)).toBe(100);
    expect(normalizeSyncPercent(-0.1)).toBe(0);
  });
});

describe("getMempoolActivity", () => {
  it("derives simple local activity labels", () => {
    expect(getMempoolActivity(0)).toBe("Quiet");
    expect(getMempoolActivity(5)).toBe("Active");
    expect(getMempoolActivity(50)).toBe("Busy");
  });
});

describe("formatBytes", () => {
  it("formats byte values compactly", () => {
    expect(formatBytes(999)).toBe("999 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
