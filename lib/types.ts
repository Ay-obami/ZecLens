export type PoolId =
  | "transparent"
  | "sprout"
  | "sapling"
  | "orchard"
  | "lockbox"
  | "ironwood"
  | string;

export interface RpcValuePool {
  id: PoolId;
  chainValue: number;
  chainValueZat?: number;
  monitored?: boolean;
  valueDelta?: number;
  valueDeltaZat?: number;
}

export interface ValuePool {
  id: PoolId;
  zec: number;
  delta: number;
}

export interface BlockchainInfoRpc {
  chain: string;
  blocks: number;
  headers?: number;
  difficulty: number;
  verificationprogress: number;
  bestblockhash: string;
  estimatedheight: number;
  chainSupply: {
    chainValue: number;
    chainValueZat?: number;
    monitored?: boolean;
  };
  valuePools: RpcValuePool[];
}

export interface NetworkInfoRpc {
  version: number;
  subversion: string;
  protocolversion: number;
  connections: number;
  networks?: Array<{
    name: string;
    limited: boolean;
    reachable: boolean;
  }>;
}

export interface MempoolInfoRpc {
  size: number;
  bytes: number;
  usage: number;
}

export interface BlockRpc {
  hash: string;
  confirmations?: number;
  size: number;
  height: number;
  nTx: number;
  tx?: string[];
  time: number;
  difficulty?: number;
  previousblockhash?: string;
  valuePools?: RpcValuePool[];
}

export interface ZecSnapshot {
  updatedAt: string;
  chain: {
    name: string;
    height: number;
    estimatedHeight: number;
    syncPercent: number;
    difficulty: number;
    supply: number;
  };
  node: {
    version: string;
    protocolVersion: number;
    connections: number;
  };
  mempool: {
    count: number;
    bytes: number;
    usage: number;
    activity: "Quiet" | "Active" | "Busy";
  };
  block: {
    hash: string;
    height: number;
    time: number;
    size: number;
    transactions: number;
    previousBlockHash: string;
  };
  pools: ValuePool[];
  privacy: {
    shieldedZec: number;
    shieldedPercent: number;
  };
}
