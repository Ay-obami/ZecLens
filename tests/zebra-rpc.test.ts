import { describe, expect, it, vi } from "vitest";
import {
  RpcConfigError,
  ZebraRpcError,
  createZebraRpcClient,
  getRpcConfig,
} from "@/lib/zebra-rpc";

describe("getRpcConfig", () => {
  it("throws when TATUM_API_KEY is absent", () => {
    expect(() => getRpcConfig({ ZCASH_RPC_URL: "https://example.test" })).toThrow(
      RpcConfigError,
    );
  });

  it("uses the Tatum mainnet gateway by default", () => {
    expect(getRpcConfig({ TATUM_API_KEY: "abc" })).toEqual({
      url: "https://zcash-mainnet.gateway.tatum.io",
      apiKey: "abc",
    });
  });
});

describe("createZebraRpcClient", () => {
  it("sends the API key only in x-api-key and returns result", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: { ok: true } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createZebraRpcClient(
      { url: "https://example.test", apiKey: "secret" },
      fetchMock,
    );

    await expect(client.call<{ ok: boolean }>("getblockchaininfo")).resolves.toEqual({
      ok: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "secret" }),
      }),
    );

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(String(init.body)).not.toContain("secret");
  });

  it("converts JSON-RPC errors into safe ZebraRpcError values", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          error: { code: -1, message: "upstream detail" },
        }),
        { status: 200 },
      ),
    );

    const client = createZebraRpcClient(
      { url: "https://example.test", apiKey: "secret" },
      fetchMock,
    );

    const error = await client.call("getblockchaininfo").catch((caught) => caught);
    expect(error).toBeInstanceOf(ZebraRpcError);
    expect(error).toMatchObject({ rpcCode: -1, method: "getblockchaininfo" });
    expect(String(error)).not.toContain("secret");
    expect(String(error)).not.toContain("upstream detail");
  });

  it("rejects non-2xx upstream responses without exposing response bodies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("provider secret detail", { status: 429 }),
    );
    const client = createZebraRpcClient(
      { url: "https://example.test", apiKey: "secret" },
      fetchMock,
    );

    const error = await client.call("getmempoolinfo").catch((caught) => caught);
    expect(error).toBeInstanceOf(ZebraRpcError);
    expect(error).toMatchObject({ status: 429, method: "getmempoolinfo" });
    expect(String(error)).not.toContain("provider secret detail");
  });
});
