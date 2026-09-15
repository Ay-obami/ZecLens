"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchZecSnapshot } from "@/lib/client-snapshot";
import type { ZecSnapshot } from "@/lib/types";

const LANDING_POLL_MS = 15_000;

export interface LandingLiveState {
  snapshot: ZecSnapshot | null;
  error: string | null;
  isLoading: boolean;
  retry: () => void;
}

interface LandingLiveDataProps {
  children: (state: LandingLiveState) => ReactNode;
}

export function LandingLiveData({ children }: LandingLiveDataProps) {
  const [snapshot, setSnapshot] = useState<ZecSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const loadSnapshot = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const next = await fetchZecSnapshot(controller.signal);
      if (controller.signal.aborted) return;
      setSnapshot(next);
      setError(null);
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "Live Zcash data is temporarily unavailable.",
      );
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(() => void loadSnapshot(), 0);
    const interval = setInterval(() => void loadSnapshot(), LANDING_POLL_MS);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
      controllerRef.current?.abort();
    };
  }, [loadSnapshot]);

  const retry = useCallback(() => {
    setIsLoading(snapshot === null);
    void loadSnapshot();
  }, [loadSnapshot, snapshot]);

  return children({ snapshot, error, isLoading, retry });
}
