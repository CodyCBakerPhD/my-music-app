/**
 * Playlist generation: a port of the tag-combination logic from the original
 * Python `generate_vlc_contents`.
 *
 * Every YAML file under `data/song_metadata/` implicitly tags each of its songs
 * with the file's name.  Each song then lands in one playlist per combination of
 * one or two of its tags; small playlists are dropped, and playlists holding the
 * exact same set of songs as one with a shorter name are dropped as duplicates.
 * A YAML file under `data/manual_playlists/` named after a playlist overrides
 * that playlist's order (and contents).
 */

export interface Song {
    name: string;
    url?: string;
    creators?: string;
    notes?: string;
    /** All tags, the top-level (file name) tag first. */
    tags: string[];
    /** The metadata file this song came from. */
    source: string;
}

export interface RawSong {
    name: string;
    url?: string;
    creators?: string;
    notes?: string;
    tags?: string | null;
}

export interface Playlist {
    name: string;
    songs: string[];
    /** True when the order comes from a manual playlist file. */
    manual: boolean;
}

/** Combinations of up to this many tags each form a playlist. */
export const TAG_COMBINATION_LIMIT = 2;

/** Playlists must hold strictly more than this many songs to be kept. */
export const PLAYLIST_LENGTH_LOWER_BOUND = 2;

/** Tag combinations never turned into playlists of their own. */
export const CUSTOM_TAG_EXCLUSIONS: ReadonlySet<string> = new Set(["Primary"]);

const TAG_SEPARATOR = ", ";

/** Apply the file-level tag to each song of one metadata file. */
export function tagSongs(topTag: string, rawSongs: RawSong[]): Song[] {
    return rawSongs.map((raw) => {
        const extra = raw.tags === undefined || raw.tags === null ? [] : String(raw.tags).split(TAG_SEPARATOR);
        const song: Song = { name: String(raw.name), tags: [topTag, ...extra], source: topTag };
        if (raw.url !== undefined) song.url = String(raw.url);
        if (raw.creators !== undefined) song.creators = String(raw.creators);
        if (raw.notes !== undefined) song.notes = String(raw.notes);
        return song;
    });
}

/**
 * All `k`-combinations of `items`, in the same order as Python's
 * `itertools.combinations`.
 */
export function combinations<T>(items: readonly T[], k: number): T[][] {
    const result: T[][] = [];
    const indices: number[] = [];
    const recurse = (start: number): void => {
        if (indices.length === k) {
            result.push(indices.map((index) => items[index]));
            return;
        }
        for (let index = start; index < items.length; index++) {
            indices.push(index);
            recurse(index + 1);
            indices.pop();
        }
    };
    recurse(0);
    return result;
}

/** The names of every tag-combination playlist a song belongs to. */
export function tagCombinationsFor(tags: readonly string[], limit: number = TAG_COMBINATION_LIMIT): string[] {
    const seen = new Set<string>();
    for (let size = 1; size <= limit; size++) {
        for (const combination of combinations(tags, size)) {
            seen.add(combination.join(TAG_SEPARATOR));
        }
    }
    return [...seen];
}

/** Group songs into one playlist per tag combination, in metadata order. */
export function groupByTagCombination(songs: readonly Song[]): Map<string, string[]> {
    const playlists = new Map<string, string[]>();
    for (const song of songs) {
        for (const combination of tagCombinationsFor(song.tags)) {
            const playlist = playlists.get(combination);
            if (playlist === undefined) {
                playlists.set(combination, [song.name]);
            } else {
                playlist.push(song.name);
            }
        }
    }
    return playlists;
}

function sameMembers(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
    if (a.size !== b.size) return false;
    for (const item of a) {
        if (!b.has(item)) return false;
    }
    return true;
}

/**
 * Drop playlists too short to be useful, then those holding the same songs as
 * another (in any order).  Of a set of duplicates the shortest name wins; ties
 * go to the name that sorts first, so the result does not depend on the order
 * the metadata files were read in.
 */
export function prunePlaylists(
    playlists: ReadonlyMap<string, string[]>,
    lowerBound: number = PLAYLIST_LENGTH_LOWER_BOUND,
    exclusions: ReadonlySet<string> = CUSTOM_TAG_EXCLUSIONS
): Map<string, string[]> {
    const truncated = new Map([...playlists].filter(([, songs]) => songs.length > lowerBound));
    const asSets = new Map([...truncated].map(([name, songs]) => [name, new Set(songs)]));

    const skip = new Set(exclusions);
    const kept = new Map<string, string[]>();
    const ordered = [...truncated.keys()].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
    for (const name of ordered) {
        if (skip.has(name)) continue;

        const members = asSets.get(name)!;
        for (const [otherName, otherMembers] of asSets) {
            if (otherName === name || skip.has(otherName)) continue;
            if (sameMembers(members, otherMembers)) skip.add(otherName);
        }
        kept.set(name, truncated.get(name)!);
    }
    return kept;
}

/**
 * The final playlists: generated ones, with the order of any that have a
 * manual playlist file replaced by that file's order.
 */
export function buildPlaylists(
    songs: readonly Song[],
    manualPlaylists: ReadonlyMap<string, string[]> = new Map()
): Playlist[] {
    const pruned = prunePlaylists(groupByTagCombination(songs));
    const result: Playlist[] = [];
    for (const [name, generated] of pruned) {
        const manual = manualPlaylists.get(name);
        result.push({ name, songs: manual ?? generated, manual: manual !== undefined });
    }
    return result;
}

/** Contents of a VLC `.m3u` playlist file referencing `.wav` files beside it. */
export function toM3U(playlist: Playlist, extensionFor: (song: string) => string = () => "wav"): string {
    return playlist.songs.map((song) => `${song}.${extensionFor(song)}`).join("\n");
}
