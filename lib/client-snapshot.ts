import type { ZecSnapshot } from "@/lib/types";

type SnapshotResponse =
  | { data: ZecSnapshot }
  | { error: { code: string; message: string } };

export async function fetchZecSnapshot(
  signal?: AbortSignal,
): Promise<ZecSnapshot> {
  const response = await fetch("/api/zcash/snapshot", {
    cache: "no-store",
    signal,
  });
  const payload = (await response.json()) as SnapshotResponse;

  if (!response.ok || !("data" in payload)) {
    throw new Error(
      "error" in payload
        ? payload.error.message
        : "Live Zcash data is unavailable.",
    );
  }

  return payload.data;
}
