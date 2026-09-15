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
});
