import { expect, test } from "@playwright/test";

test("shell preserves browser accessibility controls", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("guestMode", "true");
  });
  await page.goto("/");
  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewport).not.toContain("user-scalable=no");
  expect(viewport).not.toContain("maximum-scale=1.0");
  const userSelect = await page
    .locator("body")
    .evaluate((node) => getComputedStyle(node).userSelect);
  expect(userSelect).not.toBe("none");
});

test("primary routes support browser history", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("guestMode", "true");
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Explore" }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("manifest and declared icons return successfully", async ({ page, request }) => {
  await page.addInitScript(() => {
    localStorage.setItem("guestMode", "true");
  });
  await page.goto("/");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
  expect((await request.get(manifestHref!)).ok()).toBe(true);
  for (const icon of ["/pwa-192x192.png"]) {
    expect((await request.get(icon)).ok()).toBe(true);
  }
});
