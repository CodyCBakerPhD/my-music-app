import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const MUSIC_FOLDER = fileURLToPath(new URL("../fixtures/music", import.meta.url));

test.describe("Music page", () => {
    test.beforeEach(async ({ page }) => {
        page.on("console", (msg) => {
            if (msg.type() === "warning") console.warn(`[browser:warning] ${msg.text()}`);
        });
        page.on("pageerror", (error) => {
            throw error;
        });
        await page.addInitScript(() => {
            if (!sessionStorage.getItem("keep-storage")) localStorage.clear();
        });
    });

    test("loads with the header, tabs, and summary", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("header img[alt]")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Music", level: 1 })).toBeVisible();
        await expect(page.getByRole("tab")).toHaveCount(3);
        await expect(page.locator("#stat_songs")).not.toHaveText("–");
        await expect(page.locator("#version_info")).toHaveText(/^v\d+\.\d+\.\d+ \(\w+\)$/);
    });

    test("theme toggle switches and persists", async ({ page }) => {
        await page.goto("/");
        const html = page.locator("html");
        const initial = await html.getAttribute("data-theme");
        const other = initial === "dark" ? "light" : "dark";

        await page.locator("#theme_toggle_btn").click();
        await expect(html).toHaveAttribute("data-theme", other);

        await page.evaluate(() => sessionStorage.setItem("keep-storage", "1"));
        await page.reload();
        await expect(html).toHaveAttribute("data-theme", other);
    });

    test("follows the system color scheme by default", async ({ page }) => {
        await page.emulateMedia({ colorScheme: "light" });
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    });

    test("selects playlists and deep-links to them", async ({ page }) => {
        await page.goto("/");
        await page.locator('[data-playlist="Workout"]').click();
        await expect(page.locator("#playlist_detail h2")).toHaveText("Workout");
        await expect(page.locator("#playlist_detail")).toContainText("hand-ordered");
        await expect(page).toHaveURL(/#playlists\/Workout$/);

        await page.goto("/#playlists/Alan%20Wake");
        await expect(page.locator("#playlist_detail h2")).toHaveText("Alan Wake");
        await expect(page.locator("#playlist_detail .track-name")).toHaveText([
            "Dark, Twisted and Cruel",
            "Wide Awake",
            "The Poet and the Muse",
            "Follow You Into The Dark",
        ]);
    });

    test("filters playlists", async ({ page }) => {
        await page.goto("/");
        await page.locator("#playlist_filter").fill("attacking titan, t");
        await expect(page.locator("[data-playlist]")).toHaveText([/Attacking Titan, Trailer/]);
    });

    test("downloads a playlist as .m3u", async ({ page }) => {
        await page.goto("/#playlists/Alan%20Wake");
        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("link", { name: "Download .m3u" }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe("Alan Wake.m3u");
        const text = await readFile(await download.path(), "utf8");
        expect(text).toBe(
            "Dark, Twisted and Cruel.wav\nWide Awake.wav\nThe Poet and the Muse.wav\nFollow You Into The Dark.wav"
        );
    });

    test("searches songs", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("tab", { name: "Songs" }).click();
        await expect(page).toHaveURL(/#songs$/);
        await page.locator("#song_filter").fill("Paleface");
        await expect(page.locator("#song_rows tr")).toHaveCount(1);
        await expect(page.locator("#song_rows")).toContainText("Dark, Twisted and Cruel");
        await expect(page.locator("#song_rows a")).toHaveAttribute("href", /^https:\/\/www\.youtube\.com\//);
    });

    test("offers to write into the folder where the browser can", async ({ page }) => {
        await page.goto("/#build");
        await expect(page.locator("#build_mode_note")).toContainText("straight into the chosen folder");
    });

    test("builds a VLC zip from a folder", async ({ page }) => {
        // Take the fallback path that works in every browser; the directory
        // picker cannot be driven from a test.
        await page.addInitScript(() => {
            delete window.showDirectoryPicker;
        });
        await page.goto("/#build");
        await expect(page.locator("#build_mode_note")).toContainText("vlc.zip");
        await expect(page.locator("#generate_btn")).toBeDisabled();

        await page.locator("#folder_input").setInputFiles(MUSIC_FOLDER);
        await expect(page.locator("#folder_name")).toHaveText("music");
        await expect(page.locator("#folder_check")).toContainText("Found 6 source songs and 1 modified versions.");
        await expect(page.locator("#folder_check")).toContainText("Source files not described in the metadata (2)");

        const downloadPromise = page.waitForEvent("download");
        await page.locator("#generate_btn").click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe("vlc.zip");

        await expect(page.locator("#build_result .callout")).toContainText(
            "Done, with problems. Converted 4, copied 1 modified"
        );
        await expect(page.locator("#build_result")).toContainText("Broken: EncodingError");
        await expect(page.locator("#progress_label")).toHaveText(/^6 \/ 6/);
        await expect(page.locator("#download_link")).toBeVisible();

        const entries = unzipSync(new Uint8Array(await readFile(await download.path())));
        const names = Object.keys(entries).sort();
        expect(names).toContain("vlc/Alan Wake.m3u");
        expect(names).toContain("logs/Broken_error.log");
        expect(names.filter((name) => name.endsWith(".wav"))).toHaveLength(5);

        expect(strFromU8(entries["vlc/Alan Wake.m3u"])).toBe(
            "Dark, Twisted and Cruel.wav\nWide Awake.wav\nThe Poet and the Muse.wav\nFollow You Into The Dark.wav"
        );

        // The modified version is copied byte for byte.
        const modified = await readFile(`${MUSIC_FOLDER}/modified/Wide Awake.wav`);
        expect(Buffer.from(entries["vlc/Wide Awake.wav"]).equals(modified)).toBe(true);

        // Sources are decoded and re-encoded as 44.1 kHz 16-bit PCM.
        const converted = entries["vlc/The Poet and the Muse.wav"];
        const view = new DataView(converted.buffer, converted.byteOffset);
        expect(strFromU8(converted.slice(0, 4))).toBe("RIFF");
        expect(view.getUint32(24, true)).toBe(44100);
        expect(view.getUint16(34, true)).toBe(16);
        expect(view.getUint32(40, true)).toBeGreaterThan(0);
    });

    test("writes into a real directory handle", async ({ page }) => {
        // The origin-private file system hands out the same kind of handle the
        // directory picker does, without a dialog.
        await page.goto("/#build");
        const listing = await page.evaluate(async () => {
            const { DirectorySink } = await import("/sinks.ts");
            const root = await navigator.storage.getDirectory();
            const stale = await root.getDirectoryHandle("vlc", { create: true });
            await (await (await stale.getFileHandle("stale.wav", { create: true })).createWritable()).close();

            const sink = new DirectorySink(root);
            await sink.begin();
            await sink.write("vlc/a.wav", new Uint8Array([82, 73, 70, 70]));
            await sink.write("vlc/Mix.m3u", "a.wav");
            await sink.write("logs/b_error.log", "boom");
            await sink.finish();

            const list = async (name) => {
                const folder = await root.getDirectoryHandle(name);
                const entries = [];
                for await (const [entry, handle] of folder.entries()) {
                    entries.push(`${name}/${entry}:${(await handle.getFile()).size}`);
                }
                return entries.sort();
            };
            return [...(await list("vlc")), ...(await list("logs"))];
        });
        expect(listing).toEqual(["vlc/Mix.m3u:5", "vlc/a.wav:4", "logs/b_error.log:4"]);
    });
});
