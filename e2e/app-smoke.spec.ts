import { expect, test } from "@playwright/test";

test("serves the Matisa app shell", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  await expect(response.text()).resolves.toContain("<!doctype html>");
});
