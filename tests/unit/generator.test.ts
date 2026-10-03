import {
    checkFolder,
    classifyFiles,
    generateVLCContents,
    relativeParts,
    splitStem,
    type InputFile,
    type OutputSink,
    type Progress,
} from "../../src/generator";
import { parseLibrary } from "../../src/library";
import type { PCMSource } from "../../src/wav";

class MemorySink implements OutputSink {
    files = new Map<string, Uint8Array | string>();
    began = 0;
    finished = 0;
    async begin(): Promise<void> {
        this.began++;
    }
    async write(path: string, data: Uint8Array | string): Promise<void> {
        this.files.set(path, data);
    }
    async finish(): Promise<void> {
        this.finished++;
    }
}

function input(path: string, content = path): InputFile {
    return { path, file: new Blob([content]) };
}

const silence: PCMSource = {
    numberOfChannels: 1,
    sampleRate: 8000,
    length: 2,
    getChannelData: () => new Float32Array(2),
};

const library = parseLibrary(
    {
        "./data/song_metadata/Mix.yaml": "- name: a\n- name: b\n- name: c\n",
        "./data/song_metadata/Other.yaml": "- name: d\n- name: e\n- name: f\n",
    },
    {}
);

describe("splitStem", () => {
    test("splits on the last dot", () => {
        expect(splitStem("Lumière à l'Aube.mp3")).toEqual({ stem: "Lumière à l'Aube", extension: "mp3" });
        expect(splitStem("Dr. Stone.flac")).toEqual({ stem: "Dr. Stone", extension: "flac" });
        expect(splitStem("noext")).toEqual({ stem: "noext", extension: "" });
        expect(splitStem(".hidden")).toEqual({ stem: ".hidden", extension: "" });
    });
});

describe("relativeParts", () => {
    test("accepts paths with or without the chosen folder's own name", () => {
        expect(relativeParts("music/source/a.mp3")).toEqual(["source", "a.mp3"]);
        expect(relativeParts("source/a.mp3")).toEqual(["source", "a.mp3"]);
        expect(relativeParts("music/notes.txt")).toEqual(["music", "notes.txt"]);
    });
});

describe("classifyFiles", () => {
    test("sorts files into source, modified, and ignored", () => {
        const layout = classifyFiles([
            input("music/source/a.mp3"),
            input("music/source/.DS_Store"),
            input("music/modified/a.wav"),
            input("music/source/nested/x.mp3"),
            input("music/readme.txt"),
        ]);
        expect([...layout.source.keys()]).toEqual(["a"]);
        expect([...layout.modified.keys()]).toEqual(["a"]);
        expect(layout.ignored.map((file) => file.path)).toEqual([
            "music/source/.DS_Store",
            "music/source/nested/x.mp3",
            "music/readme.txt",
        ]);
    });
});

describe("checkFolder", () => {
    test("reports gaps between the folder and the metadata", () => {
        const layout = classifyFiles([
            input("source/a.mp3"),
            input("source/b.mp3"),
            input("source/stray.mp3"),
            input("modified/orphan.wav"),
        ]);
        expect(checkFolder(layout, library)).toEqual({
            missingFromSource: ["c", "d", "e", "f"],
            notInMetadata: ["stray"],
            orphanedModified: ["orphan"],
        });
    });
});

describe("generateVLCContents", () => {
    test("refuses an empty source folder", async () => {
        await expect(generateVLCContents(classifyFiles([]), library, new MemorySink())).rejects.toThrow(
            /No original songs/
        );
    });

    test("converts sources, copies modified versions, and writes complete playlists", async () => {
        const layout = classifyFiles([
            input("source/a.mp3"),
            input("source/b.mp3"),
            input("source/c.mp3"),
            input("modified/b.wav", "hand-edited"),
        ]);
        const sink = new MemorySink();
        const decoded: string[] = [];
        const progress: Progress[] = [];
        const result = await generateVLCContents(layout, library, sink, {
            decoder: async (file) => {
                decoded.push(await file.text());
                return silence;
            },
            onProgress: (update) => progress.push(update),
        });

        expect(decoded.sort()).toEqual(["source/a.mp3", "source/c.mp3"]);
        expect(result.converted.sort()).toEqual(["a", "c"]);
        expect(result.copied).toEqual(["b"]);
        expect(new TextDecoder().decode(sink.files.get("vlc/b.wav") as Uint8Array)).toBe("hand-edited");
        expect((sink.files.get("vlc/a.wav") as Uint8Array).length).toBe(44 + 4);

        expect(result.playlistsWritten).toEqual(["Mix"]);
        expect(sink.files.get("vlc/Mix.m3u")).toBe("a.wav\nb.wav\nc.wav");
        expect(result.playlistsIncomplete.get("Other")).toEqual(["d", "e", "f"]);
        expect(sink.files.has("vlc/Other.m3u")).toBe(false);

        expect(result.errors).toEqual([]);
        expect(result.countMismatch).toBeNull();
        expect(sink.began).toBe(1);
        expect(sink.finished).toBe(1);
        expect(progress[0]).toEqual({ done: 0, total: 3, current: "" });
        expect(progress.at(-1)?.done).toBe(3);
    });

    test("logs songs that fail to decode and reports the count mismatch", async () => {
        const layout = classifyFiles([input("source/a.mp3"), input("source/b.mp3"), input("source/c.mp3")]);
        const sink = new MemorySink();
        const result = await generateVLCContents(layout, library, sink, {
            decoder: async (file) => {
                if ((await file.text()).includes("b.mp3")) throw new TypeError("bad header");
                return silence;
            },
        });

        expect(result.errors).toEqual([{ song: "b", message: "TypeError: bad header" }]);
        expect(String(sink.files.get("logs/b_error.log"))).toMatch(/^TypeError: bad header/);
        expect(result.playlistsIncomplete.get("Mix")).toEqual(["b"]);
        expect(result.countMismatch).toEqual({ pre: 3, post: 2 });
    });

    test("logs non-Error failures too", async () => {
        const layout = classifyFiles([input("source/a.mp3")]);
        const sink = new MemorySink();
        const result = await generateVLCContents(layout, library, sink, {
            decoder: () => Promise.reject("nope"),
        });
        expect(result.errors).toEqual([{ song: "a", message: "nope" }]);
        expect(sink.files.get("logs/a_error.log")).toBe("nope");
    });
});
