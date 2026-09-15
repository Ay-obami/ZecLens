import { describe, expect, it } from "vitest";
import { formatFreshness, poolPercent } from "@/lib/landing-metrics";

describe("landing metrics", () => {
  it("formats recent snapshot age", () => {
    expect(
      formatFreshness(
        "2026-09-15T09:18:00.000Z",
        Date.parse("2026-09-15T09:18:12.000Z"),
      ),
    ).toBe("Updated 12 seconds ago");
  });

  it("formats minute-old snapshots", () => {
    expect(
      formatFreshness(
        "2026-09-15T09:16:00.000Z",
        Date.parse("2026-09-15T09:18:12.000Z"),
      ),
    ).toBe("Updated 2 minutes ago");
  });

  it("returns a safe percentage", () => {
    expect(poolPercent(25, 100)).toBe(25);
    expect(poolPercent(25, 0)).toBe(0);
  });
});
