/**
 * The song metadata and manual playlists, bundled into the page at build time
 * from the YAML files under `data/`.
 */

import { load } from "js-yaml";
import { buildPlaylists, tagSongs, type Playlist, type RawSong, type Song } from "./playlists";

export interface Library {
    songs: Song[];
    playlists: Playlist[];
    manualPlaylists: Map<string, string[]>;
}

const songMetadataFiles = import.meta.glob<string>("./data/song_metadata/*.yaml", {
    query: "?raw",
    import: "default",
    eager: true,
});

const manualPlaylistFiles = import.meta.glob<string>("./data/manual_playlists/*.yaml", {
    query: "?raw",
    import: "default",
    eager: true,
});

/** `./data/song_metadata/Elden Ring.yaml` → `Elden Ring` */
export function stemOf(path: string): string {
    const base = path.slice(path.lastIndexOf("/") + 1);
    const dot = base.lastIndexOf(".");
    return dot > 0 ? base.slice(0, dot) : base;
}

/** A YAML list; an empty file is an empty list. */
function loadList<T>(text: string): T[] {
    if (text.trim() === "") return [];
    return (load(text) as T[] | null) ?? [];
}

function byPath(files: Record<string, string>): [string, string][] {
    return Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Build a library from `{ path: yamlText }` records. */
export function parseLibrary(
    songMetadata: Record<string, string>,
    manualPlaylistSources: Record<string, string>
): Library {
    const songs: Song[] = [];
    for (const [path, text] of byPath(songMetadata)) {
        songs.push(...tagSongs(stemOf(path), loadList<RawSong>(text)));
    }

    const manualPlaylists = new Map<string, string[]>();
    for (const [path, text] of byPath(manualPlaylistSources)) {
        manualPlaylists.set(
            stemOf(path),
            loadList<unknown>(text).map((name) => String(name))
        );
    }

    return { songs, playlists: buildPlaylists(songs, manualPlaylists), manualPlaylists };
}

let cached: Library | undefined;

/** The library bundled with the page. */
export function getLibrary(): Library {
    cached ??= parseLibrary(songMetadataFiles, manualPlaylistFiles);
    return cached;
}
