"use client";

import { HeroSection } from "./HeroSection";
import { useLandingLiveData } from "./LandingLiveData";
import { LiveMetricsStrip } from "./LiveMetricsStrip";
import { PrivacyOverview } from "./PrivacyOverview";

export function LandingPage() {
  const { snapshot, error, isLoading, retry } = useLandingLiveData();

  return (
    <main>
      <HeroSection
        snapshot={snapshot}
        isLive={Boolean(snapshot && !error)}
        isLoading={isLoading}
      />
      <LiveMetricsStrip
        snapshot={snapshot}
        error={error}
        isLoading={isLoading}
        onRetry={retry}
      />
      <PrivacyOverview snapshot={snapshot} isLoading={isLoading} />
    </main>
  );
}
