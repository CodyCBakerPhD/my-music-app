import rawHTML from "../../src/index.html?raw";
import { parseLibrary } from "../../src/library";
import {
    fill,
    formatHash,
    h,
    initApp,
    linkFor,
    matchesQuery,
    parseHash,
    renderFolderCheck,
    renderResult,
    toggleTheme,
} from "../../src/ui";
import { classifyFiles, type GenerationResult } from "../../src/generator";

const body = rawHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i)![1].replace(/<script[\s\S]*?<\/script>/gi, "");

const library = parseLibrary(
    {
        "./data/song_metadata/Games.yaml": [
            "- name: Wide Awake",
            "  url: https://www.youtube.com/watch?v=1",
            "  creators: Jaimes",
            "  tags: Workout",
            "- name: Alicia",
            "  url: steam",
            "  creators: Lorien Testard",
            "  tags: Workout",
            "  notes: The original.",
            "- name: Barricades",
            "  url: https://www.youtube.com/watch?v=2",
            "  creators: Sawano",
            "  tags: Workout",
            "- name: Lone",
            "  creators: Someone",
        ].join("\n"),
    },
    { "./data/manual_playlists/Games.yaml": "- Lone\n- Alicia\n- Ghost song\n" }
);

function $(selector: string): HTMLElement {
    return document.querySelector(selector) as HTMLElement;
}

beforeEach(() => {
    document.body.innerHTML = body;
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.clear();
    history.replaceState(null, "", "#");
    initApp(document, library);
});

describe("helpers", () => {
    test("h sets attributes and skips empty children", () => {
        const element = h("a", { href: "x", hidden: true, title: undefined, download: false }, "text", null, false);
        expect(element.outerHTML).toBe('<a href="x" hidden="">text</a>');
    });

    test("fill skips empty children", () => {
        const element = h("div", {}, "old");
        fill(element, "new", null, undefined, false);
        expect(element.textContent).toBe("new");
    });

    test("linkFor accepts web links only", () => {
        expect(linkFor("https://www.youtube.com/watch?v=1")).toEqual({
            href: "https://www.youtube.com/watch?v=1",
            label: "youtube.com",
        });
        expect(linkFor("steam")).toBeNull();
        expect(linkFor("javascript:alert(1)")).toBeNull();
        expect(linkFor("not a url")).toBeNull();
        expect(linkFor(undefined)).toBeNull();
    });

    test("matchesQuery searches name, creators, and tags", () => {
        const [wideAwake] = library.songs;
        expect(matchesQuery(wideAwake, "")).toBe(true);
        expect(matchesQuery(wideAwake, "wide")).toBe(true);
        expect(matchesQuery(wideAwake, "JAIMES")).toBe(true);
        expect(matchesQuery(wideAwake, "workout")).toBe(true);
        expect(matchesQuery(wideAwake, "zzz")).toBe(false);
    });

    test("hash routes round-trip", () => {
        expect(parseHash("")).toEqual({ view: "playlists", playlist: null });
        expect(parseHash("#songs")).toEqual({ view: "songs", playlist: null });
        expect(parseHash("#bogus")).toEqual({ view: "playlists", playlist: null });
        const route = { view: "playlists" as const, playlist: "Games, Workout" };
        expect(parseHash(formatHash(route))).toEqual(route);
        expect(formatHash({ view: "build", playlist: null })).toBe("#build");
    });

    test("toggleTheme flips and remembers the theme", () => {
        expect(toggleTheme()).toBe("light");
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
        expect(localStorage.getItem("theme")).toBe("light");
        expect(toggleTheme()).toBe("dark");
    });
});

describe("app", () => {
    test("shows the summary", () => {
        expect($("#stat_songs").textContent).toBe("4");
        expect($("#stat_playlists").textContent).toBe(String(library.playlists.length));
        expect($("#stat_tags").textContent).toBe("2");
        expect($("#stat_manual").textContent).toBe("1");
        expect($("#version_info").textContent).toBe("v0.0.0-test (testhash)");
    });

    test("opens on the first playlist", () => {
        expect($("#view_playlists").hidden).toBe(false);
        expect($("#view_songs").hidden).toBe(true);
        expect($("#tab_playlists").getAttribute("aria-selected")).toBe("true");
        expect($("#playlist_detail h2").textContent).toBe("Games");
        expect($("#playlist_detail").textContent).toContain("hand-ordered");
        const tracks = [...document.querySelectorAll("#playlist_detail .track-name")].map((el) => el.textContent);
        expect(tracks).toEqual(["Lone", "Alicia", "Ghost song"]);
        expect($("#playlist_detail").textContent).toContain("not in metadata");
    });

    test("selects a playlist from the list", () => {
        $('[data-playlist="Workout"]').click();
        expect($("#playlist_detail h2").textContent).toBe("Workout");
        expect(location.hash).toBe("#playlists/Workout");
        expect($('[data-playlist="Workout"]').getAttribute("aria-current")).toBe("true");
        expect(document.querySelectorAll("#playlist_detail a[href^='https://']").length).toBe(2);
    });

    test("filters playlists", () => {
        const filter = $("#playlist_filter") as HTMLInputElement;
        filter.value = "work";
        filter.dispatchEvent(new Event("input"));
        expect([...document.querySelectorAll("[data-playlist]")].map((el) => el.getAttribute("data-playlist"))).toEqual(
            ["Workout"]
        );
        filter.value = "nothing matches";
        filter.dispatchEvent(new Event("input"));
        expect($("#playlist_list").textContent).toContain("No playlists match.");
    });

    test("switches tabs and filters songs", () => {
        $("#tab_songs").click();
        expect($("#view_songs").hidden).toBe(false);
        expect($("#view_playlists").hidden).toBe(true);
        expect(location.hash).toBe("#songs");
        expect(document.querySelectorAll("#song_rows tr").length).toBe(4);
        expect($("#song_rows").textContent).toContain("The original.");

        const filter = $("#song_filter") as HTMLInputElement;
        filter.value = "sawano";
        filter.dispatchEvent(new Event("input"));
        expect(document.querySelectorAll("#song_rows tr").length).toBe(1);
        expect($("#song_count").textContent).toBe("1 of 4");
    });

    test("follows the hash", () => {
        location.hash = "#build";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        expect($("#view_build").hidden).toBe(false);
    });

    test("theme button toggles the theme", () => {
        $("#theme_toggle_btn").click();
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    test("explains the zip fallback where folders cannot be written", () => {
        expect($("#build_mode_note").textContent).toContain("vlc.zip");
        expect(($("#generate_btn") as HTMLButtonElement).disabled).toBe(true);
    });
});

describe("build reports", () => {
    test("folder check lists the gaps", () => {
        const layout = classifyFiles([
            { path: "music/source/Alicia.mp3", file: new Blob() },
            { path: "music/source/Stray.mp3", file: new Blob() },
            { path: "music/cover.jpg", file: new Blob() },
        ]);
        renderFolderCheck(layout, library);
        const text = $("#folder_check").textContent ?? "";
        expect(text).toContain("Found 2 source songs and 0 modified versions. 1 other files will be ignored.");
        expect(text).toContain("Songs in the metadata with no source file (3)");
        expect(text).toContain("Source files not described in the metadata (1)");
        expect(text).not.toContain("Modified files with no source counterpart");
    });

    test("long lists are truncated", () => {
        const files = Array.from({ length: 60 }, (_, index) => ({ path: `source/s${index}.mp3`, file: new Blob() }));
        renderFolderCheck(classifyFiles(files), library);
        expect($("#folder_check").textContent).toContain("…and 10 more");
    });

    test("result summarizes success", () => {
        const result: GenerationResult = {
            converted: ["a", "b"],
            copied: ["c"],
            errors: [],
            playlistsWritten: ["Mix"],
            playlistsIncomplete: new Map(),
            countMismatch: null,
        };
        renderResult(result);
        expect($("#build_result .callout.success").textContent).toBe(
            "Done. Converted 2, copied 1 modified, wrote 1 playlists."
        );
    });

    test("result lists problems", () => {
        const result: GenerationResult = {
            converted: [],
            copied: [],
            errors: [{ song: "a", message: "bad" }],
            playlistsIncomplete: new Map([["Mix", ["a", "b", "c", "d", "e", "f"]]]),
            playlistsWritten: [],
            countMismatch: { pre: 1, post: 0 },
        };
        renderResult(result);
        const text = $("#build_result").textContent ?? "";
        expect($("#build_result .callout.warning")).not.toBeNull();
        expect(text).toContain("File counts (pre: 1, post: 0) do not match.");
        expect(text).toContain("a: bad");
        expect(text).toContain("Mix: missing a, b, c, d, e, …");
        expect(text).toContain("Playlists skipped for missing songs (not written) (1)");
        for (const details of document.querySelectorAll("#build_result details")) {
            expect((details as HTMLDetailsElement).open).toBe(true);
        }
    });
});
