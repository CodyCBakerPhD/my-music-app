import { strFromU8, unzipSync } from "fflate";
import { DirectorySink, supportsDirectoryWrite, ZipSink, type DirectoryHandle } from "../../src/sinks";

/** An in-memory stand-in for a `FileSystemDirectoryHandle`. */
class FakeDirectory implements DirectoryHandle {
    folders = new Map<string, FakeDirectory>();
    files = new Map<string, BufferSource | string>();
    removed: string[] = [];

    constructor(public name: string) {}

    async getDirectoryHandle(name: string): Promise<FakeDirectory> {
        let folder = this.folders.get(name);
        if (folder === undefined) {
            folder = new FakeDirectory(name);
            this.folders.set(name, folder);
        }
        return folder;
    }

    async getFileHandle(name: string) {
        return {
            createWritable: async () => ({
                write: async (data: BufferSource | string) => {
                    this.files.set(name, data);
                },
                close: async () => {},
            }),
        };
    }

    async removeEntry(name: string): Promise<void> {
        if (!this.folders.delete(name)) throw new DOMException("missing", "NotFoundError");
        this.removed.push(name);
    }
}

describe("DirectorySink", () => {
    test("wipes vlc/ and writes into subfolders", async () => {
        const root = new FakeDirectory("music");
        const stale = await root.getDirectoryHandle("vlc");
        stale.files.set("old.wav", "stale");

        const sink = new DirectorySink(root);
        await sink.begin();
        expect(root.removed).toEqual(["vlc"]);

        await sink.write("vlc/a.wav", new Uint8Array([1, 2]));
        await sink.write("vlc/Mix.m3u", "a.wav");
        await sink.write("logs/b_error.log", "boom");
        await sink.finish();

        const vlc = root.folders.get("vlc")!;
        expect([...vlc.files.keys()]).toEqual(["a.wav", "Mix.m3u"]);
        expect(root.folders.get("logs")!.files.get("b_error.log")).toBe("boom");
    });

    test("starts fine when there is no vlc/ yet", async () => {
        const root = new FakeDirectory("music");
        await new DirectorySink(root).begin();
        expect(root.removed).toEqual([]);
    });
});

describe("ZipSink", () => {
    test("bundles everything into a zip", async () => {
        const sink = new ZipSink();
        await sink.begin();
        await sink.write("vlc/a.wav", new Uint8Array([82, 73, 70, 70]));
        await sink.write("vlc/Mix.m3u", "a.wav");
        await sink.finish();

        expect(sink.blob?.type).toBe("application/zip");
        const entries = unzipSync(new Uint8Array(await sink.blob!.arrayBuffer()));
        expect(Object.keys(entries).sort()).toEqual(["vlc/Mix.m3u", "vlc/a.wav"]);
        expect(strFromU8(entries["vlc/Mix.m3u"])).toBe("a.wav");
        expect([...entries["vlc/a.wav"]]).toEqual([82, 73, 70, 70]);
    });

    test("begin resets a previous run", async () => {
        const sink = new ZipSink();
        await sink.write("vlc/old.wav", "x");
        await sink.finish();
        await sink.begin();
        expect(sink.blob).toBeNull();
        await sink.finish();
        expect(Object.keys(unzipSync(new Uint8Array(await sink.blob!.arrayBuffer())))).toEqual([]);
    });
});

describe("supportsDirectoryWrite", () => {
    test("detects the directory picker", () => {
        expect(supportsDirectoryWrite({ showDirectoryPicker: () => {} })).toBe(true);
        expect(supportsDirectoryWrite({})).toBe(false);
    });
});
