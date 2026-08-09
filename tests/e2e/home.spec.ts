import { test, expect } from "@playwright/test";

/**
 * These guard the one failure the rest of this file cannot see: when the app
 * crashes before React mounts (a missing VITE_SUPABASE_* var is the usual
 * cause), every page still returns 200 and still carries the <title> from the
 * static index.html — so title and status-code assertions all pass against a
 * completely blank page. Assert on React-rendered output instead.
 */
test.describe("App boot", () => {
  const renderingRoutes = ["/", "/trips", "/audio-tours", "/login"];

  for (const route of renderingRoutes) {
    test(`${route} mounts the app and renders content`, async ({ page }) => {
      await page.goto(route);

      // Ordered deliberately: the boot-error screen is itself rendered
      // content, so checking for it first keeps the length assertion below
      // from passing on a failed boot.
      await expect(
        page.getByTestId("boot-error"),
        `${route} rendered the boot-error screen`,
      ).toHaveCount(0);

      const root = page.locator("#root");
      await expect(root).not.toBeEmpty();

      // Chrome rendered by React, independent of any backend data.
      const text = (await root.innerText()).trim();
      expect(text.length).toBeGreaterThan(20);
    });
  }

  // Data-backed routes render only a spinner when the backend is unreachable,
  // so assert the weaker property: the bundle mounted at all.
  test("/regions/:slug mounts without a boot failure", async ({ page }) => {
    await page.goto("/regions/nile-delta");
    await expect(page.getByTestId("boot-error")).toHaveCount(0);
  });

  test("home page loads without an uncaught page error", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/");
    await expect(page.locator("#root")).not.toBeEmpty();

    expect(pageErrors).toEqual([]);
  });
});

test.describe("Home page", () => {
  test("loads and shows Sandal branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sandal/);
  });

  test("Cairo font is applied", async ({ page }) => {
    await page.goto("/");
    const fontFamily = await page.evaluate(() =>
      window.getComputedStyle(document.body).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain("cairo");
  });

  test("PWA manifest is present and valid", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.status()).toBe(200);
    const manifest = await response!.json();
    expect(manifest.name).toContain("Sandal");
    expect(manifest.theme_color).toBe("#2BBFB3");
  });

  test("sitemap.xml is reachable and valid XML", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const body = await response!.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("sandaler-egypt-slowly.lovable.app");
    // All 4 curated region routes are present
    expect(body).toContain("/regions/nile-delta");
    expect(body).toContain("/regions/suez-canal");
    expect(body).toContain("/regions/frontiers");
  });

  test("robots.txt is reachable and references sitemap", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const body = await response!.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("sandaler-egypt-slowly.lovable.app/sitemap.xml");
  });
});

test.describe("Routing", () => {
  test("unknown route renders without a server crash", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-xyz");
    // SPA serves index.html for all routes — 200 from the file server
    expect([200, 404]).toContain(response?.status() ?? 0);
  });

  test("/regions/nile-delta is served", async ({ page }) => {
    const response = await page.goto("/regions/nile-delta");
    expect(response?.status()).toBe(200);
  });

  test("/login is served", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
  });
});
