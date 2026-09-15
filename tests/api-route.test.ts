import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/zcash/snapshot/route";
import { resetSnapshotCache } from "@/lib/snapshot";

describe("GET /api/zcash/snapshot", () => {
  const originalKey = process.env.TATUM_API_KEY;

  beforeEach(() => {
    resetSnapshotCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) {
      delete process.env.TATUM_API_KEY;
    } else {
      process.env.TATUM_API_KEY = originalKey;
    }
  });

  it("returns a safe configuration error when TATUM_API_KEY is missing", async () => {
    delete process.env.TATUM_API_KEY;

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: {
        code: "RPC_NOT_CONFIGURED",
        message: "Zcash RPC is not configured on the server.",
      },
    });
  });

  it("returns a safe upstream error without leaking provider details", async () => {
    process.env.TATUM_API_KEY = "secret";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("provider secret body")));

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      error: {
        code: "RPC_UNAVAILABLE",
        message: "Live Zcash data is temporarily unavailable.",
      },
    });
    expect(JSON.stringify(payload)).not.toContain("secret");
    expect(JSON.stringify(payload)).not.toContain("provider secret body");
  });
});
