"use client";

import { FeatureGrid } from "./FeatureGrid";
import { FinalCta } from "./FinalCta";
import { HeroSection } from "./HeroSection";
import { HowZecLensHelps } from "./HowZecLensHelps";
import { useLandingLiveData } from "./LandingLiveData";
import { LiveMetricsStrip } from "./LiveMetricsStrip";
import { PrivacyOverview } from "./PrivacyOverview";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { TechnicalProof } from "./TechnicalProof";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const { snapshot, error, isLoading, retry } = useLandingLiveData();
  const isLive = Boolean(snapshot && !error);

  return (
    <div className={styles.page}>
      <div className={styles.pageFrame}>
        <SiteHeader isLive={isLive} />
        <main className={styles.main}>
          <HeroSection snapshot={snapshot} isLive={isLive} isLoading={isLoading} />
          <LiveMetricsStrip
            snapshot={snapshot}
            error={error}
            isLoading={isLoading}
            onRetry={retry}
          />
          <FeatureGrid />
          <PrivacyOverview snapshot={snapshot} isLoading={isLoading} />
          <HowZecLensHelps />
          <TechnicalProof />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
