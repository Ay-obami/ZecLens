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
      "ZecLensDashboard",
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
      "HowZecLensHelps",
      "TechnicalProof",
      "FinalCta",
      "SiteFooter",
    ]) {
      expect(landing).toContain(component);
    }

    expect(landing).not.toContain("Built directly on Zebra RPC");
  });

  it("links the dashboard back to the product landing page", async () => {
    const dashboard = await source("components/ZecLensDashboard.tsx");
    expect(dashboard).toContain('href="/"');
    expect(dashboard).toContain("Back to ZecLens");
  });

  it("keeps dashboard messaging product-focused", async () => {
    const dashboard = await source("components/ZecLensDashboard.tsx");
    expect(dashboard).toContain(
      "A live view of Zcash mainnet activity, health, privacy, and network flow.",
    );
    expect(dashboard).toContain("Live Zcash mainnet telemetry");
    expect(dashboard).not.toContain("built directly from Zebra JSON-RPC data");
    expect(dashboard).not.toContain("Powered by Zebra RPC");
  });

  it("uses the ZecLens product name", async () => {
    const dashboard = await source("components/ZecLensDashboard.tsx");
    const header = await source("components/landing/SiteHeader.tsx");
    const footer = await source("components/landing/SiteFooter.tsx");

    expect(dashboard).toContain("ZecLens");
    expect(header).toContain("ZecLens");
    expect(footer).toContain("ZecLens");
  });
});
