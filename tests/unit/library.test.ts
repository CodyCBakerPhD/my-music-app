import { getLibrary, parseLibrary, stemOf } from "../../src/library";

describe("stemOf", () => {
    test("strips folder and extension", () => {
        expect(stemOf("./data/song_metadata/Elden Ring.yaml")).toBe("Elden Ring");
        expect(stemOf("./data/manual_playlists/E33 (Curated).yaml")).toBe("E33 (Curated)");
        expect(stemOf("noextension")).toBe("noextension");
    });
});

describe("parseLibrary", () => {
    const metadata = {
        "./data/song_metadata/B.yaml": "- name: b1\n- name: b2\n- name: b3\n",
        "./data/song_metadata/A.yaml": "- name: a1\n  tags: Mix\n- name: a2\n  tags: Mix\n- name: a3\n  tags: Mix\n",
        "./data/song_metadata/Empty.yaml": "",
    };

    test("reads files in path order so the result does not depend on the bundler", () => {
        const library = parseLibrary(metadata, {});
        expect(library.songs.map((song) => song.name)).toEqual(["a1", "a2", "a3", "b1", "b2", "b3"]);
        expect(library.songs[0].tags).toEqual(["A", "Mix"]);
    });

    test("drops the duplicate combination in favor of the shorter name", () => {
        const names = parseLibrary(metadata, {}).playlists.map((playlist) => playlist.name);
        expect(names).toContain("A");
        expect(names).toContain("B");
        expect(names).not.toContain("Mix");
        expect(names).not.toContain("A, Mix");
    });

    test("applies manual playlists by file name", () => {
        const library = parseLibrary(metadata, { "./data/manual_playlists/B.yaml": "- b3\n- b1\n" });
        expect(library.playlists.find((playlist) => playlist.name === "B")).toEqual({
            name: "B",
            songs: ["b3", "b1"],
            manual: true,
        });
        expect(library.manualPlaylists.get("B")).toEqual(["b3", "b1"]);
    });
});

describe("bundled library", () => {
    const library = getLibrary();

    test("loads every metadata file", () => {
        expect(library.songs.length).toBeGreaterThan(0);
        const sources = new Set(library.songs.map((song) => song.source));
        expect(sources).toContain("Workout");
        expect(sources).toContain("Elden Ring");
    });

    test("every song has a name and the file's tag first", () => {
        for (const song of library.songs) {
            expect(song.name.length).toBeGreaterThan(0);
            expect(song.tags[0]).toBe(song.source);
        }
    });

    test("never emits the excluded 'Primary' playlist", () => {
        expect(library.playlists.map((playlist) => playlist.name)).not.toContain("Primary");
    });

    test("uses the hand-ordered Workout playlist", () => {
        const workout = library.playlists.find((playlist) => playlist.name === "Workout");
        expect(workout?.manual).toBe(true);
        expect(workout?.songs).toEqual(library.manualPlaylists.get("Workout"));
    });

    test("is cached", () => {
        expect(getLibrary()).toBe(library);
    });
});
