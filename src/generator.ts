/**
 * The in-browser replacement for the original `generate_vlc_contents`.
 *
 * Given the files of a music folder laid out as
 *
 *     source/     every song, in any format the browser can decode
 *     modified/   optional hand-edited versions, matched to a source by file stem
 *
 * it writes
 *
 *     vlc/        one `.wav` per source song plus one `.m3u` per complete playlist
 *     logs/       one `<song>_error.log` per song that could not be converted
 */

import type { Library } from "./library";
import { toM3U } from "./playlists";
import { encodeWAV, type PCMSource } from "./wav";

export interface InputFile {
    /** Path relative to the chosen music folder, e.g. `source/Alicia.mp3`. */
    path: string;
    file: Blob;
}

export interface OutputSink {
    /** Prepare the destination; the original tool wiped `vlc/` on every run. */
    begin(): Promise<void>;
    write(path: string, data: Uint8Array<ArrayBuffer> | string): Promise<void>;
    finish(): Promise<void>;
}

export type Decoder = (file: Blob) => Promise<PCMSource>;

export interface Progress {
    done: number;
    total: number;
    current: string;
}

export interface SongError {
    song: string;
    message: string;
}

export interface GenerationResult {
    converted: string[];
    copied: string[];
    errors: SongError[];
    playlistsWritten: string[];
    /** Playlist name → the songs it references that have no output file. */
    playlistsIncomplete: Map<string, string[]>;
    countMismatch: { pre: number; post: number } | null;
}

export interface FolderLayout {
    /** Song stem → source file. */
    source: Map<string, InputFile>;
    /** Song stem → modified file. */
    modified: Map<string, InputFile>;
    /** Files in neither folder, which are ignored. */
    ignored: InputFile[];
}

export interface FolderCheck {
    /** Songs in the metadata with no file in `source/`. */
    missingFromSource: string[];
    /** Files in `source/` that no metadata file describes. */
    notInMetadata: string[];
    /** Files in `modified/` with no counterpart in `source/`. */
    orphanedModified: string[];
}

export function splitStem(fileName: string): { stem: string; extension: string } {
    const dot = fileName.lastIndexOf(".");
    if (dot <= 0) return { stem: fileName, extension: "" };
    return { stem: fileName.slice(0, dot), extension: fileName.slice(dot + 1) };
}

/**
 * Normalize a path to be relative to the chosen music folder.  A directory
 * `<input>` reports paths that start with the folder's own name, while a
 * directory handle reports them relative to it; both are accepted.
 */
export function relativeParts(path: string): string[] {
    const parts = path.split("/").filter((part) => part.length > 0);
    const at = parts.findIndex((part) => part === "source" || part === "modified");
    return at === -1 ? parts : parts.slice(at);
}

export function classifyFiles(files: readonly InputFile[]): FolderLayout {
    const layout: FolderLayout = { source: new Map(), modified: new Map(), ignored: [] };
    for (const input of files) {
        const parts = relativeParts(input.path);
        const name = parts[parts.length - 1] ?? "";
        const isHidden = name.startsWith(".");
        if (parts.length === 2 && !isHidden && (parts[0] === "source" || parts[0] === "modified")) {
            layout[parts[0]].set(splitStem(name).stem, input);
        } else {
            layout.ignored.push(input);
        }
    }
    return layout;
}

export function checkFolder(layout: FolderLayout, library: Library): FolderCheck {
    const described = new Set(library.songs.map((song) => song.name));
    return {
        missingFromSource: [...described].filter((name) => !layout.source.has(name)),
        notInMetadata: [...layout.source.keys()].filter((stem) => !described.has(stem)),
        orphanedModified: [...layout.modified.keys()].filter((stem) => !layout.source.has(stem)),
    };
}

/** Decode with the Web Audio API, resampled to 44.1 kHz. */
export const webAudioDecoder: Decoder = async (file) => {
    const context = new OfflineAudioContext(2, 1, 44100);
    return context.decodeAudioData(await file.arrayBuffer());
};

async function runPool<T>(items: readonly T[], concurrency: number, work: (item: T) => Promise<void>): Promise<void> {
    let next = 0;
    const worker = async (): Promise<void> => {
        while (next < items.length) {
            const item = items[next++];
            await work(item);
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, worker));
}

export interface GenerateOptions {
    decoder?: Decoder;
    concurrency?: number;
    onProgress?: (progress: Progress) => void;
}

export async function generateVLCContents(
    layout: FolderLayout,
    library: Library,
    sink: OutputSink,
    { decoder = webAudioDecoder, concurrency = 2, onProgress }: GenerateOptions = {}
): Promise<GenerationResult> {
    if (layout.source.size === 0) {
        throw new Error("No original songs found in the 'source' folder.");
    }

    await sink.begin();

    const result: GenerationResult = {
        converted: [],
        copied: [],
        errors: [],
        playlistsWritten: [],
        playlistsIncomplete: new Map(),
        countMismatch: null,
    };
    const written = new Set<string>();
    const songs = [...layout.source.entries()];
    let done = 0;
    onProgress?.({ done, total: songs.length, current: "" });

    await runPool(songs, concurrency, async ([stem, input]) => {
        try {
            const modified = layout.modified.get(stem);
            if (modified !== undefined) {
                await sink.write(`vlc/${stem}.wav`, new Uint8Array(await modified.file.arrayBuffer()));
                result.copied.push(stem);
            } else {
                // Always re-encode: inconsistent source encodings trip up the player otherwise.
                await sink.write(`vlc/${stem}.wav`, encodeWAV(await decoder(input.file)));
                result.converted.push(stem);
            }
            written.add(stem);
        } catch (error) {
            const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
            const stack = error instanceof Error && error.stack ? `\n\n${error.stack}` : "";
            result.errors.push({ song: stem, message });
            await sink.write(`logs/${stem}_error.log`, message + stack);
        }
        done += 1;
        onProgress?.({ done, total: songs.length, current: stem });
    });

    // Playlists last, and only those whose every song made it into `vlc/`.
    for (const playlist of library.playlists) {
        const missing = playlist.songs.filter((song) => !written.has(song));
        if (missing.length > 0) {
            result.playlistsIncomplete.set(playlist.name, missing);
            continue;
        }
        await sink.write(`vlc/${playlist.name}.m3u`, toM3U(playlist));
        result.playlistsWritten.push(playlist.name);
    }

    if (written.size !== layout.source.size) {
        result.countMismatch = { pre: layout.source.size, post: written.size };
    }

    await sink.finish();
    return result;
}
