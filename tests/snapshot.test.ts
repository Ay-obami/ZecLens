import { beforeEach, describe, expect, it } from "vitest";
import {
  fetchFreshSnapshot,
  getCachedSnapshot,
  resetSnapshotCache,
} from "@/lib/snapshot";
import type { ZebraRpcClient } from "@/lib/zebra-rpc";

const chain = {
  chain: "main",
  blocks: 3484052,
  difficulty: 342458717.76770127,
  verificationprogress: 0.9999991389343739,
  bestblockhash: "chain-hash",
  estimatedheight: 3484055,
  chainSupply: { chainValue: 16933464.2280448 },
  valuePools: [
    { id: "transparent", chainValue: 11975320.43846347 },
    { id: "sprout", chainValue: 22591.46261837 },
    { id: "sapling", chainValue: 511432.18508329 },
    { id: "orchard", chainValue: 415705.11108245 },
    { id: "lockbox", chainValue: 63309.9375 },
    { id: "ironwood", chainValue: 3945105.09329722 },
  ],
};

const network = {
  version: 6020100,
  subversion: "/Zebra:6.2.1/",
  protocolversion: 170160,
  connections: 75,
};

const mempool = { size: 5, bytes: 10133, usage: 10133 };
const bestHash = "0000000000320da96eb31fbe5cad020abc97933aca02197e06b6293134d289fa";
const block = {
  hash: bestHash,
  size: 1630,
  height: 3484055,
  nTx: 1,
  time: 1789460347,
  previousblockhash: "previous",
  valuePools: [
    { id: "transparent", chainValue: 11975320.50144848, valueDelta: 1.375 },
    { id: "sprout", chainValue: 22591.46261837, valueDelta: 0 },
    { id: "sapling", chainValue: 511427.18283329, valueDelta: 0 },
    { id: "orchard", chainValue: 415705.11108245, valueDelta: 0 },
    { id: "lockbox", chainValue: 63310.5, valueDelta: 0.1875 },
    { id: "ironwood", chainValue: 3945114.15756221, valueDelta: 0 },
  ],
};

function makeClient() {
  const calls: Array<[string, unknown[]]> = [];
  const client = {
    async call<T>(method: string, params: unknown[] = []): Promise<T> {
      calls.push([method, params]);
      if (method === "getblockchaininfo") return chain as T;
      if (method === "getnetworkinfo") return network as T;
      if (method === "getmempoolinfo") return mempool as T;
      if (method === "getbestblockhash") return bestHash as T;
      if (method === "getblock") return block as T;
      throw new Error(`Unexpected method ${method}`);
    },
  } satisfies ZebraRpcClient;

  return { client, calls };
}

describe("snapshot normalization", () => {
  beforeEach(() => resetSnapshotCache());

  it("normalizes all five verified RPC responses", async () => {
    const { client, calls } = makeClient();
    const snapshot = await fetchFreshSnapshot(client, {
      throttleMs: 0,
      now: () => new Date("2026-09-15T08:00:00.000Z"),
    });

    expect(snapshot.chain).toMatchObject({
      name: "main",
      height: 3484052,
      estimatedHeight: 3484055,
      supply: 16933464.2280448,
    });
    expect(snapshot.node).toMatchObject({
      version: "/Zebra:6.2.1/",
      connections: 75,
    });
    expect(snapshot.mempool).toEqual({
      count: 5,
      bytes: 10133,
      usage: 10133,
      activity: "Active",
    });
    expect(snapshot.block).toMatchObject({
      height: 3484055,
      transactions: 1,
      size: 1630,
    });
    expect(snapshot.pools.find((pool) => pool.id === "lockbox")?.delta).toBe(0.1875);
    expect(snapshot.privacy.shieldedZec).toBeGreaterThan(0);
    expect(calls.map(([method]) => method)).toEqual([
      "getblockchaininfo",
      "getnetworkinfo",
      "getmempoolinfo",
      "getbestblockhash",
      "getblock",
    ]);
    expect(calls[4][1]).toEqual([bestHash, 1]);
  });

  it("reuses one snapshot within the 15-second cache window", async () => {
    const { client, calls } = makeClient();
    const options = {
      throttleMs: 0,
      now: () => new Date("2026-09-15T08:00:00.000Z"),
    };

    const first = await getCachedSnapshot(client, 1_000, options);
    const second = await getCachedSnapshot(client, 14_999, options);

    expect(second).toBe(first);
    expect(calls).toHaveLength(5);
  });
});
