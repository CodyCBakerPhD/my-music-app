import {
    buildPlaylists,
    combinations,
    groupByTagCombination,
    prunePlaylists,
    tagCombinationsFor,
    tagSongs,
    toM3U,
    type Song,
} from "../../src/playlists";

function song(name: string, ...tags: string[]): Song {
    return { name, tags, source: tags[0] };
}

describe("tagSongs", () => {
    test("prepends the file's tag to each song's own tags", () => {
        const songs = tagSongs("Anime", [
            { name: "Near", tags: "Deathnote", url: "https://example.com", creators: "CJ Music" },
            { name: "Plain" },
            { name: "Null tags", tags: null },
            { name: "Many", tags: "Primary, Original", notes: "a note" },
        ]);
        expect(songs.map((s) => s.tags)).toEqual([
            ["Anime", "Deathnote"],
            ["Anime"],
            ["Anime"],
            ["Anime", "Primary", "Original"],
        ]);
        expect(songs[0]).toMatchObject({ url: "https://example.com", creators: "CJ Music", source: "Anime" });
        expect(songs[3].notes).toBe("a note");
        expect(songs[1]).not.toHaveProperty("url");
    });

    test("stringifies names YAML reads as numbers", () => {
        expect(tagSongs("X", [{ name: 33 as unknown as string }])[0].name).toBe("33");
    });
});

describe("combinations", () => {
    test("matches itertools.combinations order", () => {
        expect(combinations(["a", "b", "c"], 2)).toEqual([
            ["a", "b"],
            ["a", "c"],
            ["b", "c"],
        ]);
        expect(combinations(["a", "b"], 1)).toEqual([["a"], ["b"]]);
        expect(combinations(["a"], 2)).toEqual([]);
    });
});

describe("tagCombinationsFor", () => {
    test("singles and ordered pairs, without duplicates", () => {
        expect(tagCombinationsFor(["A", "B", "C"])).toEqual(["A", "B", "C", "A, B", "A, C", "B, C"]);
        expect(tagCombinationsFor(["A", "A"])).toEqual(["A", "A, A"]);
    });
});

describe("groupByTagCombination", () => {
    test("keeps metadata order within each playlist", () => {
        const groups = groupByTagCombination([song("1", "A", "B"), song("2", "A"), song("3", "A", "B")]);
        expect(groups.get("A")).toEqual(["1", "2", "3"]);
        expect(groups.get("A, B")).toEqual(["1", "3"]);
        expect(groups.get("B")).toEqual(["1", "3"]);
    });
});

describe("prunePlaylists", () => {
    test("drops playlists with two songs or fewer", () => {
        const pruned = prunePlaylists(
            new Map([
                ["Short", ["1", "2"]],
                ["Long", ["1", "2", "3"]],
            ])
        );
        expect([...pruned.keys()]).toEqual(["Long"]);
    });

    test("keeps the shortest name among playlists with the same songs in any order", () => {
        const pruned = prunePlaylists(
            new Map([
                ["Games, Workout", ["1", "2", "3"]],
                ["Workout", ["3", "2", "1"]],
                ["Games", ["1", "2", "3", "4"]],
            ])
        );
        expect([...pruned.keys()].sort()).toEqual(["Games", "Workout"]);
    });

    test("breaks ties between equally long names alphabetically", () => {
        const pruned = prunePlaylists(
            new Map([
                ["Bb", ["1", "2", "3"]],
                ["Aa", ["1", "2", "3"]],
            ])
        );
        expect([...pruned.keys()]).toEqual(["Aa"]);
    });

    test("never emits an excluded tag, nor lets it shadow a duplicate", () => {
        const pruned = prunePlaylists(
            new Map([
                ["Primary", ["1", "2", "3"]],
                ["X, Primary", ["1", "2", "3"]],
            ])
        );
        expect([...pruned.keys()]).toEqual(["X, Primary"]);
    });
});

describe("buildPlaylists", () => {
    const songs = [song("a", "Mix"), song("b", "Mix"), song("c", "Mix")];

    test("uses generated order by default", () => {
        expect(buildPlaylists(songs)).toEqual([{ name: "Mix", songs: ["a", "b", "c"], manual: false }]);
    });

    test("replaces a playlist with its manual file", () => {
        const manual = new Map([
            ["Mix", ["c", "a", "extra"]],
            ["Unused", ["z"]],
        ]);
        expect(buildPlaylists(songs, manual)).toEqual([{ name: "Mix", songs: ["c", "a", "extra"], manual: true }]);
    });
});

describe("toM3U", () => {
    test("one relative .wav path per line", () => {
        expect(toM3U({ name: "Mix", songs: ["a", "Lumière à l'Aube"], manual: false })).toBe(
            "a.wav\nLumière à l'Aube.wav"
        );
    });

    test("accepts a per-song extension", () => {
        expect(toM3U({ name: "Mix", songs: ["a", "b"], manual: false }, (s) => (s === "a" ? "mp3" : "wav"))).toBe(
            "a.mp3\nb.wav"
        );
    });
});
