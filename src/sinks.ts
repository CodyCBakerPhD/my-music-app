/**
 * Where generated files go: straight into a folder on disk where the browser
 * allows it (the File System Access API, in Chromium-based browsers), or into
 * a `.zip` download everywhere else.
 */

import { zipSync, strToU8, type Zippable } from "fflate";
import type { OutputSink } from "./generator";

/** The subset of `FileSystemDirectoryHandle` used, so tests can pass a stand-in. */
export interface DirectoryHandle {
    name: string;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandle>;
    getFileHandle(
        name: string,
        options?: { create?: boolean }
    ): Promise<{
        createWritable(): Promise<{ write(data: BufferSource | string): Promise<void>; close(): Promise<void> }>;
    }>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
}

export class DirectorySink implements OutputSink {
    private readonly folders = new Map<string, Promise<DirectoryHandle>>();

    constructor(private readonly root: DirectoryHandle) {}

    async begin(): Promise<void> {
        // A fresh `vlc/` every run, so nothing left over from an earlier one lingers.
        try {
            await this.root.removeEntry("vlc", { recursive: true });
        } catch {
            // Did not exist yet.
        }
        this.folders.clear();
    }

    private folder(name: string): Promise<DirectoryHandle> {
        let handle = this.folders.get(name);
        if (handle === undefined) {
            handle = this.root.getDirectoryHandle(name, { create: true });
            this.folders.set(name, handle);
        }
        return handle;
    }

    async write(path: string, data: Uint8Array<ArrayBuffer> | string): Promise<void> {
        const slash = path.indexOf("/");
        const folder = await this.folder(path.slice(0, slash));
        const file = await folder.getFileHandle(path.slice(slash + 1), { create: true });
        const writable = await file.createWritable();
        await writable.write(data);
        await writable.close();
    }

    async finish(): Promise<void> {}
}

export class ZipSink implements OutputSink {
    private files: Zippable = {};
    blob: Blob | null = null;

    async begin(): Promise<void> {
        this.files = {};
        this.blob = null;
    }

    async write(path: string, data: Uint8Array<ArrayBuffer> | string): Promise<void> {
        // WAV barely compresses, so store it and save the time.
        const bytes = typeof data === "string" ? strToU8(data) : data;
        this.files[path] = [bytes, { level: path.endsWith(".wav") ? 0 : 6 }];
    }

    async finish(): Promise<void> {
        const zipped = zipSync(this.files);
        this.blob = new Blob([zipped as Uint8Array<ArrayBuffer>], { type: "application/zip" });
        this.files = {};
    }
}

export function supportsDirectoryWrite(target: object = globalThis): boolean {
    return "showDirectoryPicker" in target;
}
