import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchZecSnapshot } from "@/lib/client-snapshot";

const snapshot = {
  updatedAt: "2026-09-15T09:18:13.930Z",
  chain: {
    name: "main",
    height: 3484101,
    estimatedHeight: 3484102,
    syncPercent: 99.99,
    difficulty: 1,
    supply: 16933540,
  },
  node: {
    version: "/Zebra:6.2.1/",
    protocolVersion: 170160,
    connections: 7,
  },
  mempool: { count: 5, bytes: 100, usage: 100, activity: "Active" },
  block: {
    hash: "abc",
    height: 3484101,
    time: 1789463776,
    size: 71389,
    transactions: 12,
    previousBlockHash: "def",
  },
  pools: [],
  privacy: { shieldedZec: 4894816, shieldedPercent: 28.9 },
};

afterEach(() => vi.restoreAllMocks());

describe("fetchZecSnapshot", () => {
  it("returns normalized snapshot data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: snapshot }), { status: 200 }),
      ),
    );

    await expect(fetchZecSnapshot()).resolves.toEqual(snapshot);
  });

  it("throws the API message when the snapshot endpoint fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "RPC_UNAVAILABLE",
              message: "Live Zcash data is unavailable.",
            },
          }),
          { status: 503 },
        ),
      ),
    );

    await expect(fetchZecSnapshot()).rejects.toThrow(
      "Live Zcash data is unavailable.",
    );
  });
});
