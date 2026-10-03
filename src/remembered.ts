/**
 * Remembers the chosen music folder between visits.
 *
 * Chromium-based browsers can store a folder handle in IndexedDB and hand it
 * back later; reading or writing through it again needs the person to allow
 * it once per visit, which the browser asks for on a click.
 */

const DATABASE = "music-app";
const STORE = "folders";
const KEY = "music";

/** Where the handle is kept; the default is IndexedDB. */
export interface HandleStore {
    get(): Promise<FileSystemDirectoryHandle | null>;
    set(handle: FileSystemDirectoryHandle): Promise<void>;
    clear(): Promise<void>;
}

type PermissionedHandle = FileSystemDirectoryHandle & {
    queryPermission?(descriptor: { mode: "readwrite" }): Promise<PermissionState>;
    requestPermission?(descriptor: { mode: "readwrite" }): Promise<PermissionState>;
};

function request<T>(operation: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        operation.onsuccess = () => resolve(operation.result);
        operation.onerror = () => reject(operation.error);
    });
}

function open(): Promise<IDBDatabase> {
    const opening = indexedDB.open(DATABASE, 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore(STORE);
    return request(opening);
}

async function withStore<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const database = await open();
    try {
        return await request(work(database.transaction(STORE, mode).objectStore(STORE)));
    } finally {
        database.close();
    }
}

export const indexedDBStore: HandleStore = {
    async get() {
        const handle = await withStore("readonly", (store) => store.get(KEY));
        return (handle as FileSystemDirectoryHandle | undefined) ?? null;
    },
    async set(handle) {
        await withStore("readwrite", (store) => store.put(handle, KEY));
    },
    async clear() {
        await withStore("readwrite", (store) => store.delete(KEY));
    },
};

/** The remembered folder, or null when there is none or storage is unavailable. */
export async function recallFolder(store: HandleStore = indexedDBStore): Promise<FileSystemDirectoryHandle | null> {
    try {
        return await store.get();
    } catch {
        return null;
    }
}

/** Remember a folder; failing to is not worth interrupting the person over. */
export async function rememberFolder(
    handle: FileSystemDirectoryHandle,
    store: HandleStore = indexedDBStore
): Promise<void> {
    try {
        await store.set(handle);
    } catch {
        // Storage unavailable (private window, say); the folder is just not remembered.
    }
}

export async function forgetFolder(store: HandleStore = indexedDBStore): Promise<void> {
    try {
        await store.clear();
    } catch {
        // Nothing stored, or storage unavailable.
    }
}

/**
 * Make sure the folder can be read and written again, asking the person if
 * need be.  Call from a click handler: browsers only show the prompt then.
 */
export async function regainAccess(handle: FileSystemDirectoryHandle): Promise<boolean> {
    const permissioned = handle as PermissionedHandle;
    const descriptor = { mode: "readwrite" } as const;
    // A browser without the permission calls grants access with the handle.
    if (permissioned.queryPermission === undefined) return true;
    if ((await permissioned.queryPermission(descriptor)) === "granted") return true;
    return (await permissioned.requestPermission?.(descriptor)) === "granted";
}
