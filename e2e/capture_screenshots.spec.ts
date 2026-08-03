import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.use({
  viewport: { width: 390, height: 844 }, // Mobile iPhone viewport
  deviceScaleFactor: 2,
});

test("capture screenshots of every single screen and modal in Matisa", async ({ page }) => {
  test.setTimeout(120_000); // 2 minute timeout to allow capturing all screens

  const screenshotsDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const capture = async (filename: string) => {
    await page.waitForTimeout(400);
    const screenshotPath = path.join(screenshotsDir, filename);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${filename}`);
  };

  // 1. Home - Discover Tab
  await page.goto("/", { waitUntil: "networkidle" }).catch(() => {});
  await capture("01_home_discover.png");

  // 2. Home - Following Tab
  const followingTab = page.locator("button", { hasText: "Following" }).first();
  if (await followingTab.isVisible().catch(() => false)) {
    await followingTab.click();
    await capture("02_home_following.png");
  }

  // 3. Explore / Discovery - Tabs
  await page.goto("/explore", { waitUntil: "networkidle" }).catch(() => {});
  await capture("03_explore_all.png");

  const voiceCategory = page.locator("button", { hasText: "Voice Notes" }).first();
  if (await voiceCategory.isVisible().catch(() => false)) {
    await voiceCategory.click();
    await capture("04_explore_voice.png");
  }

  const roomsCategory = page.locator("button", { hasText: "Live Rooms" }).first();
  if (await roomsCategory.isVisible().catch(() => false)) {
    await roomsCategory.click();
    await capture("05_explore_rooms.png");
  }

  const eventsCategory = page.locator("button", { hasText: "Events" }).first();
  if (await eventsCategory.isVisible().catch(() => false)) {
    await eventsCategory.click();
    await capture("06_explore_events.png");
  }

  const peopleCategory = page.locator("button", { hasText: "People" }).first();
  if (await peopleCategory.isVisible().catch(() => false)) {
    await peopleCategory.click();
    await capture("07_explore_people.png");
  }

  // 4. Notes Screen
  await page.goto("/notes", { waitUntil: "networkidle" }).catch(() => {});
  await capture("08_notes.png");

  // 5. Events Screen
  await page.goto("/events", { waitUntil: "networkidle" }).catch(() => {});
  await capture("09_events.png");

  // 6. Activity / Notifications Screen
  await page.goto("/activity", { waitUntil: "networkidle" }).catch(() => {});
  await capture("10_activity.png");

  // 7. Profile Screen & Sub-tabs
  await page.goto("/profile", { waitUntil: "networkidle" }).catch(() => {});
  await capture("11_profile_notes.png");

  const voiceTab = page.locator("button", { hasText: "Voice" }).first();
  if (await voiceTab.isVisible().catch(() => false)) {
    await voiceTab.click();
    await capture("12_profile_voice.png");
  }

  const profileEventsTab = page.locator("button", { hasText: "Events" }).first();
  if (await profileEventsTab.isVisible().catch(() => false)) {
    await profileEventsTab.click();
    await capture("13_profile_events.png");
  }

  const videosTab = page.locator("button", { hasText: "Videos" }).first();
  if (await videosTab.isVisible().catch(() => false)) {
    await videosTab.click();
    await capture("14_profile_videos.png");
  }

  const savedTab = page.locator("button", { hasText: "Saved" }).first();
  if (await savedTab.isVisible().catch(() => false)) {
    await savedTab.click();
    await capture("15_profile_saved.png");
  }

  // 8. Inbox / Messages List
  await page.goto("/inbox", { waitUntil: "networkidle" }).catch(() => {});
  await capture("16_inbox.png");

  // 9. Chat Room
  await page.goto("/messages/demo-conv-1", { waitUntil: "networkidle" }).catch(() => {});
  await capture("17_chat_room.png");

  // 10. Rooms Screen & Sub-tabs
  await page.goto("/rooms", { waitUntil: "networkidle" }).catch(() => {});
  await capture("18_rooms_karaoke.png");

  const voiceRoomsTab = page.locator("button", { hasText: "Voice Rooms" }).first();
  if (await voiceRoomsTab.isVisible().catch(() => false)) {
    await voiceRoomsTab.click();
    await capture("19_rooms_voice.png");
  }

  // 11. Live Room Stage
  await page.goto("/rooms/demo-room-1", { waitUntil: "networkidle" }).catch(() => {});
  await capture("20_room_live_stage.png");

  // 12. Settings Screen
  await page.goto("/settings", { waitUntil: "networkidle" }).catch(() => {});
  await capture("21_settings.png");

  // 13. Auth Screen
  await page.goto("/auth", { waitUntil: "networkidle" }).catch(() => {});
  await capture("22_auth.png");

  // 14. Onboarding Screen
  await page.goto("/onboarding", { waitUntil: "networkidle" }).catch(() => {});
  await capture("23_onboarding.png");

  // 15. Create Sheet Modal
  await page.goto("/", { waitUntil: "networkidle" }).catch(() => {});
  const createBtn = page.locator("button.relative.flex.items-center.justify-center").first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
    await capture("24_create_sheet_menu.png");

    const textNoteOpt = page.locator("button", { hasText: "Text Note" }).first();
    if (await textNoteOpt.isVisible().catch(() => false)) {
      await textNoteOpt.click();
      await capture("25_create_sheet_note_types.png");

      const tempNoteOpt = page.locator("button", { hasText: "Temporary Note" }).first();
      if (await tempNoteOpt.isVisible().catch(() => false)) {
        await tempNoteOpt.click();
        await capture("26_create_sheet_composer.png");
      }
    }
  }
});
