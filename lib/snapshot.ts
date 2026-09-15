import { calculatePrivacy, getMempoolActivity, normalizeSyncPercent } from "./metrics";
import type {
  BlockRpc,
  BlockchainInfoRpc,
  MempoolInfoRpc,
  NetworkInfoRpc,
  RpcValuePool,
  ValuePool,
  ZecSnapshot,
} from "./types";
import type { ZebraRpcClient } from "./zebra-rpc";

const SNAPSHOT_TTL_MS = 15_000;
const DEFAULT_THROTTLE_MS = 1_050;

type FetchOptions = {
  throttleMs?: number;
  now?: () => Date;
};

type CacheEntry = {
  value: ZecSnapshot;
  fetchedAt: number;
};

let cache: CacheEntry | null = null;
let inFlight: Promise<ZecSnapshot> | null = null;

function sleep(ms: number) {
  return ms > 0
    ? new Promise<void>((resolve) => setTimeout(resolve, ms))
    : Promise.resolve();
}

function normalizePools(
  chainPools: RpcValuePool[],
  blockPools: RpcValuePool[] = [],
): ValuePool[] {
  const merged = new Map<string, RpcValuePool>();

  for (const pool of chainPools) {
    merged.set(pool.id, pool);
  }

  for (const pool of blockPools) {
    merged.set(pool.id, { ...merged.get(pool.id), ...pool });
  }

  return [...merged.values()].map((pool) => ({
    id: pool.id,
    zec: pool.chainValue,
    delta: pool.valueDelta ?? 0,
  }));
}

export async function fetchFreshSnapshot(
  client: ZebraRpcClient,
  options: FetchOptions = {},
): Promise<ZecSnapshot> {
  const [chain, network, mempool] = await Promise.all([
    client.call<BlockchainInfoRpc>("getblockchaininfo"),
    client.call<NetworkInfoRpc>("getnetworkinfo"),
    client.call<MempoolInfoRpc>("getmempoolinfo"),
  ]);

  await sleep(options.throttleMs ?? DEFAULT_THROTTLE_MS);

  const bestHash = await client.call<string>("getbestblockhash");
  const block = await client.call<BlockRpc>("getblock", [bestHash, 1]);

  const pools = normalizePools(chain.valuePools, block.valuePools);
  const privacy = calculatePrivacy(pools, chain.chainSupply.chainValue);
  const now = options.now?.() ?? new Date();

  return {
    updatedAt: now.toISOString(),
    chain: {
      name: chain.chain,
      height: chain.blocks,
      estimatedHeight: chain.estimatedheight,
      syncPercent: normalizeSyncPercent(chain.verificationprogress),
      difficulty: chain.difficulty,
      supply: chain.chainSupply.chainValue,
    },
    node: {
      version: network.subversion,
      protocolVersion: network.protocolversion,
      connections: network.connections,
    },
    mempool: {
      count: mempool.size,
      bytes: mempool.bytes,
      usage: mempool.usage,
      activity: getMempoolActivity(mempool.size),
    },
    block: {
      hash: block.hash,
      height: block.height,
      time: block.time,
      size: block.size,
      transactions: block.nTx,
      previousBlockHash: block.previousblockhash ?? "",
    },
    pools,
    privacy,
  };
}

export async function getCachedSnapshot(
  client: ZebraRpcClient,
  now = Date.now(),
  options: FetchOptions = {},
): Promise<ZecSnapshot> {
  if (cache && now - cache.fetchedAt < SNAPSHOT_TTL_MS) {
    return cache.value;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = fetchFreshSnapshot(client, options);

  try {
    const value = await inFlight;
    cache = { value, fetchedAt: now };
    return value;
  } finally {
    inFlight = null;
  }
}

export function resetSnapshotCache() {
  cache = null;
  inFlight = null;
}
