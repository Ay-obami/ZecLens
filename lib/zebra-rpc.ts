export interface RpcConfig {
  url: string;
  apiKey: string;
}

export interface ZebraRpcClient {
  call<T>(method: string, params?: unknown[]): Promise<T>;
}

export class RpcConfigError extends Error {
  constructor() {
    super("Zcash RPC is not configured on the server.");
    this.name = "RpcConfigError";
  }
}

export class ZebraRpcError extends Error {
  readonly method: string;
  readonly status?: number;
  readonly rpcCode?: number;

  constructor(method: string, options?: { status?: number; rpcCode?: number }) {
    const statusPart = options?.status ? ` HTTP ${options.status}` : "";
    const codePart = typeof options?.rpcCode === "number" ? ` RPC ${options.rpcCode}` : "";
    super(`Zebra RPC ${method} failed.${statusPart}${codePart}`);
    this.name = "ZebraRpcError";
    this.method = method;
    this.status = options?.status;
    this.rpcCode = options?.rpcCode;
  }
}

const DEFAULT_RPC_URL = "https://zcash-mainnet.gateway.tatum.io";

export function getRpcConfig(
  env: Record<string, string | undefined> = process.env,
): RpcConfig {
  const apiKey = env.TATUM_API_KEY?.trim();
  if (!apiKey) {
    throw new RpcConfigError();
  }

  return {
    url: env.ZCASH_RPC_URL?.trim() || DEFAULT_RPC_URL,
    apiKey,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createZebraRpcClient(
  config: RpcConfig,
  fetchImpl: typeof fetch = fetch,
): ZebraRpcClient {
  return {
    async call<T>(method: string, params: unknown[] = []): Promise<T> {
      let response: Response;

      try {
        response = await fetchImpl(config.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": config.apiKey,
          },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        });
      } catch {
        throw new ZebraRpcError(method);
      }

      if (!response.ok) {
        throw new ZebraRpcError(method, { status: response.status });
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new ZebraRpcError(method);
      }

      if (!isRecord(payload)) {
        throw new ZebraRpcError(method);
      }

      if (isRecord(payload.error)) {
        const rpcCode = typeof payload.error.code === "number" ? payload.error.code : undefined;
        throw new ZebraRpcError(method, { rpcCode });
      }

      if (!("result" in payload)) {
        throw new ZebraRpcError(method);
      }

      return payload.result as T;
    },
  };
}
