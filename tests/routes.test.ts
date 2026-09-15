import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function source(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("product routes", () => {
  it("renders the landing page at root", async () => {
    expect(await source("app/page.tsx")).toContain("LandingPage");
  });

  it("renders the live observatory at /dashboard", async () => {
    expect(await source("app/dashboard/page.tsx")).toContain(
      "ZecPulseDashboard",
    );
  });

  it("includes the approved product-story sections", async () => {
    const landing = await source("components/landing/LandingPage.tsx");

    for (const component of [
      "SiteHeader",
      "HeroSection",
      "LiveMetricsStrip",
      "FeatureGrid",
      "PrivacyOverview",
      "HowZecPulseHelps",
      "TechnicalProof",
      "FinalCta",
      "SiteFooter",
    ]) {
      expect(landing).toContain(component);
    }

    expect(landing).not.toContain("Built directly on Zebra RPC");
  });

  it("links the dashboard back to the product landing page", async () => {
    const dashboard = await source("components/ZecPulseDashboard.tsx");
    expect(dashboard).toContain('href="/"');
    expect(dashboard).toContain("Back to ZecPulse");
  });

  it("keeps dashboard hero copy product-focused", async () => {
    const dashboard = await source("components/ZecPulseDashboard.tsx");

    expect(dashboard).toContain(
      "A live view of Zcash mainnet activity, health, privacy, and network flow.",
    );
    expect(dashboard).toContain("Live Zcash mainnet telemetry");
    expect(dashboard).not.toContain(
      "A live mainnet pulse built directly from Zebra JSON-RPC data.",
    );
    expect(dashboard).not.toContain("Powered by Zebra RPC");
  });
});
