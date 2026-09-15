"use client";

import { HeroSection } from "./HeroSection";
import { LandingLiveData } from "./LandingLiveData";
import { LiveMetricsStrip } from "./LiveMetricsStrip";
import { PrivacyOverview } from "./PrivacyOverview";

export function LandingPage() {
  return (
    <LandingLiveData>
      {({ snapshot, error, isLoading, retry }) => (
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
      )}
    </LandingLiveData>
  );
}
