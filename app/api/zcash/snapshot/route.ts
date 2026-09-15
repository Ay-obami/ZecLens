import { getCachedSnapshot } from "../../../../lib/snapshot";
import {
  RpcConfigError,
  createZebraRpcClient,
  getRpcConfig,
} from "../../../../lib/zebra-rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getRpcConfig();
    const client = createZebraRpcClient(config);
    const snapshot = await getCachedSnapshot(client);

    return Response.json({ data: snapshot }, { status: 200 });
  } catch (error) {
    if (error instanceof RpcConfigError) {
      return Response.json(
        {
          error: {
            code: "RPC_NOT_CONFIGURED",
            message: "Zcash RPC is not configured on the server.",
          },
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        error: {
          code: "RPC_UNAVAILABLE",
          message: "Live Zcash data is temporarily unavailable.",
        },
      },
      { status: 502 },
    );
  }
}
