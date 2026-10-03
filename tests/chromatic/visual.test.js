import { test, takeSnapshot } from "@chromatic-com/playwright";
import { fileURLToPath } from "node:url";
import { expectNoHorizontalOverflow, mockVersion, useTheme } from "../fixtures/page-mocks.js";

const MUSIC_FOLDER = fileURLToPath(new URL("../fixtures/music", import.meta.url));

/**
 * Viewports every snapshot is taken at.
 *
 * These are per-test rather than per-project because Chromatic keys an archive
 * by the test's title alone: run as Playwright projects, each viewport writes
 * over the last one's manifest and only the project that runs last reaches
 * Chromatic at all.  Naming the viewport in the test title keeps them apart.
 */
const VIEWPORTS = [
    { name: "desktop", width: 1280, height: 720 },
    { name: "tablet-portrait", width: 768, height: 1024 },
    { name: "mobile-portrait", width: 390, height: 844 },
];

const VIEWS = [
    { name: "playlists", hash: "#playlists/Alan%20Wake" },
    { name: "songs", hash: "#songs" },
    { name: "build", hash: "#build" },
];

test.describe("Music", () => {
    // Snapshots are taken explicitly below; the automatic one would duplicate them.
    test.use({ disableAutoSnapshot: true });

    for (const view of VIEWS) {
        for (const viewport of VIEWPORTS) {
            for (const theme of ["dark", "light"]) {
                test(`${view.name} — ${theme} theme — ${viewport.name}`, async ({ page }, testInfo) => {
                    await page.setViewportSize({ width: viewport.width, height: viewport.height });
                    await useTheme(page, theme);
                    await page.goto(`/${view.hash}`);
                    await page.locator(`#view_${view.name}:not([hidden])`).waitFor();
                    await mockVersion(page);
                    await expectNoHorizontalOverflow(page);
                    await takeSnapshot(page, testInfo.title, testInfo);
                });
            }
        }
    }

    for (const theme of ["dark", "light"]) {
        test(`build result — ${theme} theme — desktop`, async ({ page }, testInfo) => {
            await page.setViewportSize({ width: 1280, height: 720 });
            await useTheme(page, theme);
            // The directory picker cannot be driven from a test, so take the zip path.
            await page.addInitScript(() => {
                delete window.showDirectoryPicker;
            });
            await page.goto("/#build");
            await page.locator("#folder_input").setInputFiles(MUSIC_FOLDER);
            const download = page.waitForEvent("download");
            await page.locator("#generate_btn").click();
            await download;
            await page.locator("#build_result .callout").waitFor();
            await page.locator("#folder_check details, #build_result details").evaluateAll((elements) => {
                for (const element of elements) element.open = true;
            });
            await mockVersion(page);
            await expectNoHorizontalOverflow(page);
            await takeSnapshot(page, testInfo.title, testInfo);
        });
    }
});
