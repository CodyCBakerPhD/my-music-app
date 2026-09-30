import { expect } from "@playwright/test";

// Shared by the Playwright suites that need the page in a fixed state.

/** Pin the footer's version and commit so snapshots do not change with every release. */
export async function mockVersion(page) {
    await page.locator("#version_info").evaluate((element) => {
        element.textContent = "v0.0.0 (00000000)";
    });
}

/** Nothing on the page should be wider than the viewport. */
export async function expectNoHorizontalOverflow(page) {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, "Page width").toBeLessThanOrEqual(clientWidth);
}

/** Start in a given theme, ignoring the system preference. */
export async function useTheme(page, theme) {
    await page.addInitScript((theme) => {
        localStorage.setItem("theme", theme);
    }, theme);
}
