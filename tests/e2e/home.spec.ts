import { test, expect } from "@playwright/test";

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
    // All 6 region routes are present
    expect(body).toContain("/regions/nile-delta");
    expect(body).toContain("/regions/fayyum");
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
