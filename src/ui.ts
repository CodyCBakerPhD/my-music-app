/**
 * Page behavior: the library views, the theme toggle, and the VLC folder builder.
 */

import {
    checkFolder,
    classifyFiles,
    generateVLCContents,
    type FolderLayout,
    type GenerationResult,
    type InputFile,
} from "./generator";
import { getLibrary, type Library } from "./library";
import { toM3U, type Playlist, type Song } from "./playlists";
import { forgetFolder, recallFolder, regainAccess, rememberFolder, type HandleStore } from "./remembered";
import { DirectorySink, supportsDirectoryWrite, ZipSink, type DirectoryHandle } from "./sinks";

export type View = "playlists" | "songs" | "build";
const VIEWS: readonly View[] = ["playlists", "songs", "build"];

// ── Small DOM helpers ────────────────────────────────────────────────────────

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: Record<string, string | boolean | undefined> = {},
    ...children: Child[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
        if (value === undefined || value === false) continue;
        element.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children) {
        if (child === null || child === undefined || child === false) continue;
        element.append(child);
    }
    return element;
}

/** Replace an element's children, skipping the empty ones. */
export function fill(element: Element, ...children: Child[]): void {
    element.replaceChildren(
        ...children.filter((child): child is Node | string => child !== null && child !== undefined && child !== false)
    );
}

function byId<T extends HTMLElement = HTMLElement>(id: string, root: Document = document): T {
    const element = root.getElementById(id);
    if (element === null) throw new Error(`Missing element #${id}`);
    return element as T;
}

export function matchesQuery(song: Song, query: string): boolean {
    const needle = query.trim().toLowerCase();
    if (needle === "") return true;
    return [song.name, song.creators ?? "", ...song.tags].some((field) => field.toLowerCase().includes(needle));
}

export function linkFor(url: string | undefined): { href: string; label: string } | null {
    if (url === undefined || url === "") return null;
    if (url === "steam") return null;
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
        return { href: parsed.href, label: parsed.hostname.replace(/^www\./, "") };
    } catch {
        return null;
    }
}

function tagChips(tags: readonly string[]): HTMLElement {
    return h("span", { class: "tags" }, ...tags.map((tag) => h("span", { class: "tag" }, tag)));
}

function sourceLink(song: Song | undefined): Child {
    if (song === undefined) return null;
    const link = linkFor(song.url);
    if (link !== null) return h("a", { href: link.href, target: "_blank", rel: "noopener" }, link.label);
    return song.url ? h("span", { class: "muted" }, song.url) : null;
}

// ── Theme ────────────────────────────────────────────────────────────────────

export function toggleTheme(root: HTMLElement = document.documentElement): string {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
        localStorage.setItem("theme", next);
    } catch {
        // Storage unavailable (private mode); the choice lasts for this page only.
    }
    return next;
}

// ── Views ────────────────────────────────────────────────────────────────────

export function renderStats(library: Library, root: Document = document): void {
    const tags = new Set(library.songs.flatMap((song) => song.tags));
    byId("stat_songs", root).textContent = String(library.songs.length);
    byId("stat_playlists", root).textContent = String(library.playlists.length);
    byId("stat_tags", root).textContent = String(tags.size);
    byId("stat_manual", root).textContent = String(library.playlists.filter((playlist) => playlist.manual).length);
}

export function sortedPlaylists(playlists: readonly Playlist[]): Playlist[] {
    return [...playlists].sort((a, b) => a.name.localeCompare(b.name));
}

export function renderPlaylistList(
    library: Library,
    filter: string,
    selected: string | null,
    root: Document = document
): void {
    const list = byId("playlist_list", root);
    const needle = filter.trim().toLowerCase();
    const items = sortedPlaylists(library.playlists)
        .filter((playlist) => playlist.name.toLowerCase().includes(needle))
        .map((playlist) =>
            h(
                "li",
                {},
                h(
                    "button",
                    {
                        type: "button",
                        class: "playlist-item",
                        "data-playlist": playlist.name,
                        "aria-current": playlist.name === selected ? "true" : undefined,
                    },
                    h("span", { class: "playlist-name" }, playlist.name),
                    h("span", { class: "count" }, String(playlist.songs.length))
                )
            )
        );
    list.replaceChildren(...(items.length > 0 ? items : [h("li", { class: "muted empty" }, "No playlists match.")]));
}

export function renderPlaylistDetail(library: Library, name: string | null, root: Document = document): void {
    const detail = byId("playlist_detail", root);
    const playlist = library.playlists.find((candidate) => candidate.name === name);
    if (playlist === undefined) {
        detail.replaceChildren(h("p", { class: "muted empty" }, "Select a playlist to see its songs."));
        return;
    }

    const songsByName = new Map(library.songs.map((song) => [song.name, song]));
    const m3u = new Blob([toM3U(playlist)], { type: "audio/x-mpegurl" });
    const download =
        typeof URL.createObjectURL === "function"
            ? h(
                  "a",
                  { class: "button", href: URL.createObjectURL(m3u), download: `${playlist.name}.m3u` },
                  "Download .m3u"
              )
            : null;

    fill(
        detail,
        h(
            "header",
            { class: "detail-header" },
            h(
                "div",
                {},
                h("h2", {}, playlist.name),
                h(
                    "p",
                    { class: "muted" },
                    `${playlist.songs.length} songs · ${playlist.manual ? "hand-ordered" : "ordered by metadata"}`
                )
            ),
            download
        ),
        h(
            "ol",
            { class: "track-list" },
            ...playlist.songs.map((songName) => {
                const song = songsByName.get(songName);
                return h(
                    "li",
                    {},
                    h(
                        "div",
                        { class: "track-main" },
                        h("span", { class: "track-name" }, songName),
                        song?.creators ? h("span", { class: "muted" }, song.creators) : null,
                        song === undefined ? h("span", { class: "tag warn" }, "not in metadata") : null
                    ),
                    h("div", { class: "track-meta" }, sourceLink(song))
                );
            })
        )
    );
}

export function renderSongs(library: Library, filter: string, root: Document = document): void {
    const matching = library.songs.filter((song) => matchesQuery(song, filter));
    byId("song_count", root).textContent = `${matching.length} of ${library.songs.length}`;
    byId("song_rows", root).replaceChildren(
        ...matching.map((song) =>
            h(
                "tr",
                {},
                h(
                    "td",
                    { "data-label": "Song" },
                    h("span", { class: "track-name" }, song.name),
                    song.notes ? h("div", { class: "muted small" }, song.notes) : null
                ),
                h("td", { "data-label": "Creators" }, song.creators ?? ""),
                h("td", { "data-label": "Tags" }, tagChips(song.tags)),
                h("td", { "data-label": "Link" }, sourceLink(song))
            )
        )
    );
}

// ── Build ────────────────────────────────────────────────────────────────────

function list(title: string, items: readonly string[], { limit = 50, open = false } = {}): HTMLElement | null {
    if (items.length === 0) return null;
    const shown = items.slice(0, limit);
    return h(
        "details",
        { open },
        h("summary", {}, `${title} (${items.length})`),
        h("ul", { class: "compact" }, ...shown.map((item) => h("li", {}, item))),
        items.length > limit ? h("p", { class: "muted" }, `…and ${items.length - limit} more`) : null
    );
}

export function renderFolderCheck(layout: FolderLayout, library: Library, root: Document = document): void {
    const check = checkFolder(layout, library);
    const container = byId("folder_check", root);
    container.hidden = false;
    fill(
        container,
        h(
            "p",
            {},
            `Found ${layout.source.size} source songs and ${layout.modified.size} modified versions.`,
            layout.ignored.length > 0 ? ` ${layout.ignored.length} other files will be ignored.` : ""
        ),
        list("Songs in the metadata with no source file", check.missingFromSource),
        list("Source files not described in the metadata", check.notInMetadata),
        list("Modified files with no source counterpart", check.orphanedModified)
    );
}

export function renderResult(result: GenerationResult, root: Document = document): void {
    const incomplete = [...result.playlistsIncomplete].map(
        ([name, missing]) => `${name}: missing ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ", …" : ""}`
    );
    const ok = result.errors.length === 0 && result.playlistsIncomplete.size === 0 && result.countMismatch === null;
    fill(
        byId("build_result", root),
        h(
            "div",
            { class: ok ? "callout success" : "callout warning" },
            h("strong", {}, ok ? "Done." : "Done, with problems."),
            ` Converted ${result.converted.length}, copied ${result.copied.length} modified, wrote ${result.playlistsWritten.length} playlists.`
        ),
        result.countMismatch
            ? h(
                  "p",
                  { class: "error" },
                  `File counts (pre: ${result.countMismatch.pre}, post: ${result.countMismatch.post}) do not match.`
              )
            : null,
        // Open by default: a skipped playlist is not written at all, so any older
        // copy of it (on the phone, say) is left without the newer songs.
        list(
            "Songs that failed (see logs/)",
            result.errors.map((error) => `${error.song}: ${error.message}`),
            { open: true }
        ),
        list("Playlists skipped for missing songs (not written)", incomplete, { open: true })
    );
}

async function filesFromDirectory(handle: FileSystemDirectoryHandle): Promise<InputFile[]> {
    const files: InputFile[] = [];
    for (const folderName of ["source", "modified"]) {
        let folder: FileSystemDirectoryHandle;
        try {
            folder = await handle.getDirectoryHandle(folderName);
        } catch {
            continue;
        }
        for await (const entry of folder.values()) {
            if (entry.kind === "file") {
                files.push({ path: `${folderName}/${entry.name}`, file: await entry.getFile() });
            }
        }
    }
    return files;
}

type DirectoryPicker = (options: { mode: "readwrite"; id: string }) => Promise<FileSystemDirectoryHandle>;

interface BuildState {
    layout: FolderLayout | null;
    directory: DirectoryHandle | null;
    downloadURL: string | null;
}

function initBuild(library: Library, root: Document, handleStore?: HandleStore): void {
    const state: BuildState = { layout: null, directory: null, downloadURL: null };
    const canWrite = supportsDirectoryWrite(window);
    const pickButton = byId<HTMLButtonElement>("pick_folder_btn", root);
    const folderInput = byId<HTMLInputElement>("folder_input", root);
    const generateButton = byId<HTMLButtonElement>("generate_btn", root);
    const downloadLink = byId<HTMLAnchorElement>("download_link", root);
    const folderName = byId("folder_name", root);
    const reuseButton = byId<HTMLButtonElement>("reuse_folder_btn", root);
    const forgetButton = byId<HTMLButtonElement>("forget_folder_btn", root);
    const progress = byId("progress", root);
    const progressBar = byId<HTMLProgressElement>("progress_bar", root);
    const progressLabel = byId("progress_label", root);

    byId("build_mode_note", root).textContent = canWrite
        ? "This browser can write vlc/ and logs/ straight into the chosen folder; it will ask for permission."
        : "This browser cannot write to folders, so the output is offered as a vlc.zip download instead. " +
          "Everything is held in memory until then, so for a large library use a Chromium-based browser.";

    const accept = (layout: FolderLayout, name: string): void => {
        state.layout = layout;
        folderName.textContent = name;
        renderFolderCheck(layout, library, root);
        generateButton.disabled = layout.source.size === 0;
        byId("build_result", root).replaceChildren(
            layout.source.size === 0 ? h("p", { class: "error" }, "No songs found in a 'source' folder.") : ""
        );
    };

    const showError = (error: unknown): void => {
        byId("build_result", root).replaceChildren(h("p", { class: "error" }, String(error)));
    };

    const useDirectory = async (handle: FileSystemDirectoryHandle): Promise<void> => {
        state.directory = handle;
        const files = await filesFromDirectory(handle);
        accept(classifyFiles(files), handle.name);
    };

    let remembered: FileSystemDirectoryHandle | null = null;
    const showRemembered = (handle: FileSystemDirectoryHandle | null): void => {
        remembered = handle;
        reuseButton.hidden = handle === null;
        forgetButton.hidden = handle === null;
        reuseButton.textContent = handle === null ? "" : `Use "${handle.name}" again`;
        pickButton.textContent = handle === null ? "Choose music folder…" : "Choose another folder…";
        pickButton.className = handle === null ? "primary" : "secondary";
    };

    if (canWrite) {
        void recallFolder(handleStore).then(showRemembered);
    }

    reuseButton.addEventListener("click", async () => {
        if (remembered === null) return;
        try {
            if (!(await regainAccess(remembered))) {
                showError("Access to the folder was not allowed; choose it again or allow access when asked.");
                return;
            }
            await useDirectory(remembered);
        } catch (error) {
            // The folder was moved, renamed or deleted since.
            showError(error);
        }
    });

    forgetButton.addEventListener("click", async () => {
        await forgetFolder(handleStore);
        showRemembered(null);
    });

    pickButton.addEventListener("click", async () => {
        if (!canWrite) {
            folderInput.click();
            return;
        }
        try {
            const picker = (window as unknown as { showDirectoryPicker: DirectoryPicker }).showDirectoryPicker;
            const handle = await picker({ mode: "readwrite", id: "music" });
            await useDirectory(handle);
            await rememberFolder(handle, handleStore);
            showRemembered(handle);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            showError(error);
        }
    });

    folderInput.addEventListener("change", () => {
        const files = [...(folderInput.files ?? [])].map((file) => ({
            path: file.webkitRelativePath || file.name,
            file,
        }));
        const name = files[0]?.path.split("/")[0] ?? "";
        accept(classifyFiles(files), name);
    });

    generateButton.addEventListener("click", async () => {
        if (state.layout === null) return;
        const sink = state.directory !== null ? new DirectorySink(state.directory) : new ZipSink();
        generateButton.disabled = true;
        pickButton.disabled = true;
        reuseButton.disabled = true;
        downloadLink.hidden = true;
        if (state.downloadURL !== null) URL.revokeObjectURL(state.downloadURL);
        progress.hidden = false;
        byId("build_result", root).replaceChildren();
        try {
            const result = await generateVLCContents(state.layout, library, sink, {
                onProgress: ({ done, total, current }) => {
                    progressBar.max = total;
                    progressBar.value = done;
                    progressLabel.textContent = `${done} / ${total}${current ? ` · ${current}` : ""}`;
                },
            });
            renderResult(result, root);
            if (sink instanceof ZipSink && sink.blob !== null) {
                state.downloadURL = URL.createObjectURL(sink.blob);
                downloadLink.href = state.downloadURL;
                downloadLink.hidden = false;
                downloadLink.click();
            }
        } catch (error) {
            byId("build_result", root).replaceChildren(h("p", { class: "error" }, String(error)));
        } finally {
            generateButton.disabled = false;
            pickButton.disabled = false;
            reuseButton.disabled = false;
        }
    });
}

// ── Navigation ───────────────────────────────────────────────────────────────

export interface Route {
    view: View;
    playlist: string | null;
}

export function parseHash(hash: string): Route {
    const [view, ...rest] = hash.replace(/^#/, "").split("/");
    const playlist = rest.length > 0 ? decodeURIComponent(rest.join("/")) : null;
    return { view: (VIEWS as readonly string[]).includes(view) ? (view as View) : "playlists", playlist };
}

export function formatHash(route: Route): string {
    return route.playlist !== null ? `#${route.view}/${encodeURIComponent(route.playlist)}` : `#${route.view}`;
}

function showView(view: View, root: Document): void {
    for (const candidate of VIEWS) {
        byId(`view_${candidate}`, root).hidden = candidate !== view;
        const tab = byId(`tab_${candidate}`, root);
        tab.setAttribute("aria-selected", String(candidate === view));
        tab.tabIndex = candidate === view ? 0 : -1;
    }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export function initApp(root: Document = document, library: Library = getLibrary()): void {
    let playlistFilter = "";
    const firstPlaylist = sortedPlaylists(library.playlists)[0]?.name ?? null;
    let route = parseHash(location.hash);

    const render = (): void => {
        showView(route.view, root);
        const selected = route.playlist ?? firstPlaylist;
        renderPlaylistList(library, playlistFilter, selected, root);
        renderPlaylistDetail(library, selected, root);
    };

    renderStats(library, root);
    renderSongs(library, "", root);
    render();

    const navigate = (next: Route): void => {
        route = next;
        history.replaceState(null, "", formatHash(route));
        render();
    };

    for (const view of VIEWS) {
        byId(`tab_${view}`, root).addEventListener("click", () => navigate({ ...route, view }));
    }
    byId("playlist_list", root).addEventListener("click", (event) => {
        const button = (event.target as HTMLElement).closest<HTMLElement>("[data-playlist]");
        if (button !== null) navigate({ view: "playlists", playlist: button.dataset.playlist ?? null });
    });
    byId<HTMLInputElement>("playlist_filter", root).addEventListener("input", (event) => {
        playlistFilter = (event.target as HTMLInputElement).value;
        render();
    });
    byId<HTMLInputElement>("song_filter", root).addEventListener("input", (event) => {
        renderSongs(library, (event.target as HTMLInputElement).value, root);
    });
    window.addEventListener("hashchange", () => {
        route = parseHash(location.hash);
        render();
    });
    byId("theme_toggle_btn", root).addEventListener("click", () => toggleTheme(root.documentElement));

    byId("version_info", root).textContent = `v${__APP_VERSION__} (${__GIT_HASH__})`;

    initBuild(library, root);
}
