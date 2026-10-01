import { forgetFolder, recallFolder, regainAccess, rememberFolder, type HandleStore } from "../../src/remembered";

const handle = { name: "music", kind: "directory" } as unknown as FileSystemDirectoryHandle;

function memoryStore(): HandleStore & { value: FileSystemDirectoryHandle | null } {
    return {
        value: null,
        async get() {
            return this.value;
        },
        async set(next) {
            this.value = next;
        },
        async clear() {
            this.value = null;
        },
    };
}

const broken: HandleStore = {
    get: () => Promise.reject(new Error("no storage")),
    set: () => Promise.reject(new Error("no storage")),
    clear: () => Promise.reject(new Error("no storage")),
};

describe("remembering the folder", () => {
    test("remembers, recalls, and forgets", async () => {
        const store = memoryStore();
        expect(await recallFolder(store)).toBeNull();
        await rememberFolder(handle, store);
        expect(await recallFolder(store)).toBe(handle);
        await forgetFolder(store);
        expect(await recallFolder(store)).toBeNull();
    });

    test("carries on quietly without storage", async () => {
        await expect(rememberFolder(handle, broken)).resolves.toBeUndefined();
        await expect(recallFolder(broken)).resolves.toBeNull();
        await expect(forgetFolder(broken)).resolves.toBeUndefined();
    });

    test("IndexedDB missing (as in jsdom) recalls nothing", async () => {
        await expect(recallFolder()).resolves.toBeNull();
    });
});

describe("regainAccess", () => {
    const withPermissions = (query: PermissionState, request: PermissionState) => {
        const asked: string[] = [];
        const h = {
            queryPermission: async () => query,
            requestPermission: async () => {
                asked.push("request");
                return request;
            },
        } as unknown as FileSystemDirectoryHandle;
        return { h, asked };
    };

    test("does not ask when access is still granted", async () => {
        const { h, asked } = withPermissions("granted", "denied");
        expect(await regainAccess(h)).toBe(true);
        expect(asked).toEqual([]);
    });

    test("asks, and reports the answer", async () => {
        const allowed = withPermissions("prompt", "granted");
        expect(await regainAccess(allowed.h)).toBe(true);
        expect(allowed.asked).toEqual(["request"]);
        expect(await regainAccess(withPermissions("prompt", "denied").h)).toBe(false);
    });

    test("assumes access where the browser has no permission calls", async () => {
        expect(await regainAccess(handle)).toBe(true);
    });
});
