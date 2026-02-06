import type { OfflineData } from '../types'

const DB_NAME = 'physioconnect_offline'
const DB_VERSION = 1

// Store names
const STORES = {
    PATIENTS: 'patients',
    EXERCISES: 'exercises',
    PROGRESS: 'progress',
    SYNC_QUEUE: 'sync_queue',
    VIDEOS: 'videos_cache'
} as const

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
                db.createObjectStore(STORES.PATIENTS, { keyPath: 'localId' })
            }
            if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
                db.createObjectStore(STORES.EXERCISES, { keyPath: 'localId' })
            }
            if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
                db.createObjectStore(STORES.PROGRESS, { keyPath: 'localId' })
            }
            if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'localId' })
                syncStore.createIndex('synced', 'synced')
                syncStore.createIndex('timestamp', 'timestamp')
            }
            if (!db.objectStoreNames.contains(STORES.VIDEOS)) {
                db.createObjectStore(STORES.VIDEOS, { keyPath: 'id' })
            }
        }
    })
}

// Generic storage operations
export const storage = {
    async save<T>(storeName: string, data: T, localId: string): Promise<void> {
        const db = await openDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)

        const offlineData: OfflineData<T> = {
            data,
            localId,
            action: 'create',
            timestamp: new Date().toISOString(),
            synced: false
        }

        store.put(offlineData)

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    },

    async get<T>(storeName: string, localId: string): Promise<OfflineData<T> | undefined> {
        const db = await openDB()
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const request = store.get(localId)

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close()
                resolve(request.result)
            }
            request.onerror = () => {
                db.close()
                reject(request.error)
            }
        })
    },

    async getAll<T>(storeName: string): Promise<OfflineData<T>[]> {
        const db = await openDB()
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const request = store.getAll()

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close()
                resolve(request.result)
            }
            request.onerror = () => {
                db.close()
                reject(request.error)
            }
        })
    },

    async delete(storeName: string, localId: string): Promise<void> {
        const db = await openDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        store.delete(localId)

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    },

    async clear(storeName: string): Promise<void> {
        const db = await openDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        store.clear()

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    },

    async getUnsyncedCount(): Promise<number> {
        const db = await openDB()
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly')
        const store = tx.objectStore(STORES.SYNC_QUEUE)
        const index = store.index('synced')
        const request = index.count(IDBKeyRange.only(false))

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close()
                resolve(request.result)
            }
            request.onerror = () => {
                db.close()
                reject(request.error)
            }
        })
    },

    async markAsSynced(localId: string, serverId: string): Promise<void> {
        const db = await openDB()
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite')
        const store = tx.objectStore(STORES.SYNC_QUEUE)
        const request = store.get(localId)

        request.onsuccess = () => {
            const data = request.result
            if (data) {
                data.synced = true
                data.serverId = serverId
                store.put(data)
            }
        }

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    }
}

// Video caching for offline playback
export const videoCache = {
    async cacheVideo(videoId: string, blob: Blob): Promise<void> {
        const db = await openDB()
        const tx = db.transaction(STORES.VIDEOS, 'readwrite')
        const store = tx.objectStore(STORES.VIDEOS)

        store.put({
            id: videoId,
            blob,
            cachedAt: new Date().toISOString()
        })

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    },

    async getVideo(videoId: string): Promise<Blob | null> {
        const db = await openDB()
        const tx = db.transaction(STORES.VIDEOS, 'readonly')
        const store = tx.objectStore(STORES.VIDEOS)
        const request = store.get(videoId)

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close()
                resolve(request.result?.blob || null)
            }
            request.onerror = () => {
                db.close()
                reject(request.error)
            }
        })
    },

    async isVideoCached(videoId: string): Promise<boolean> {
        const video = await this.getVideo(videoId)
        return video !== null
    },

    async getCacheSize(): Promise<number> {
        const db = await openDB()
        const tx = db.transaction(STORES.VIDEOS, 'readonly')
        const store = tx.objectStore(STORES.VIDEOS)
        const request = store.getAll()

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close()
                const totalSize = request.result.reduce((acc, item) => {
                    return acc + (item.blob?.size || 0)
                }, 0)
                resolve(totalSize)
            }
            request.onerror = () => {
                db.close()
                reject(request.error)
            }
        })
    },

    async clearCache(): Promise<void> {
        return storage.clear(STORES.VIDEOS)
    }
}

// Generate a unique local ID
export function generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export { STORES }
export default storage
