// ============================================
// CACHE MANAGER - CINÉ TN
// ============================================

class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.CACHE_DURATION = {
            catalogue: 5 * 60 * 1000,      // 5 minutes
            details: 60 * 60 * 1000,       // 1 heure
            genres: 24 * 60 * 60 * 1000,   // 24 heures
            search: 2 * 60 * 1000          // 2 minutes
        };
        this.STORAGE_PREFIX = 'cinetn_cache_';
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @param {string} type - Cache type (catalogue, details, genres, search)
     * @returns {any|null} Cached data or null if expired/not found
     */
    get(key, type = 'catalogue') {
        // Try memory cache first
        const memoryData = this.memoryCache.get(key);
        if (memoryData && !this.isExpired(memoryData.timestamp, type)) {
            console.log('✅ Cache HIT (memory):', key);
            return memoryData.data;
        }

        // Try localStorage cache
        try {
            const storageKey = this.STORAGE_PREFIX + key;
            const cached = localStorage.getItem(storageKey);

            if (cached) {
                const parsed = JSON.parse(cached);
                if (!this.isExpired(parsed.timestamp, type)) {
                    console.log('✅ Cache HIT (storage):', key);
                    // Restore to memory cache
                    this.memoryCache.set(key, parsed);
                    return parsed.data;
                } else {
                    // Remove expired cache
                    localStorage.removeItem(storageKey);
                }
            }
        } catch (error) {
            console.error('Cache read error:', error);
        }

        console.log('❌ Cache MISS:', key);
        return null;
    }

    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {string} type - Cache type
     */
    set(key, data, type = 'catalogue') {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            type: type
        };

        // Store in memory
        this.memoryCache.set(key, cacheEntry);

        // Store in localStorage (with error handling for quota)
        try {
            const storageKey = this.STORAGE_PREFIX + key;
            localStorage.setItem(storageKey, JSON.stringify(cacheEntry));
            console.log('💾 Cached:', key, `(${type})`);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ localStorage quota exceeded, clearing old cache');
                this.clearOldCache();
                // Try again
                try {
                    localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(cacheEntry));
                } catch (e) {
                    console.error('Failed to cache after cleanup:', e);
                }
            }
        }
    }

    /**
     * Check if cache is expired
     * @param {number} timestamp - Cache timestamp
     * @param {string} type - Cache type
     * @returns {boolean}
     */
    isExpired(timestamp, type) {
        const duration = this.CACHE_DURATION[type] || this.CACHE_DURATION.catalogue;
        return Date.now() - timestamp > duration;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.memoryCache.clear();

        // Clear localStorage cache
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('🗑️ Cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    /**
     * Clear old cache entries to free up space
     */
    clearOldCache() {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));

            // Parse all cache entries with timestamps
            const entries = cacheKeys.map(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    return { key, timestamp: data.timestamp };
                } catch {
                    return { key, timestamp: 0 };
                }
            });

            // Sort by timestamp (oldest first)
            entries.sort((a, b) => a.timestamp - b.timestamp);

            // Remove oldest 50%
            const toRemove = Math.ceil(entries.length / 2);
            for (let i = 0; i < toRemove; i++) {
                localStorage.removeItem(entries[i].key);
            }

            console.log(`🗑️ Removed ${toRemove} old cache entries`);
        } catch (error) {
            console.error('Error clearing old cache:', error);
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const memorySize = this.memoryCache.size;
        let storageSize = 0;

        try {
            const keys = Object.keys(localStorage);
            storageSize = keys.filter(key => key.startsWith(this.STORAGE_PREFIX)).length;
        } catch (error) {
            console.error('Error getting cache stats:', error);
        }

        return {
            memoryEntries: memorySize,
            storageEntries: storageSize,
            totalEntries: memorySize + storageSize
        };
    }
}

// Global instance
const cacheManager = new CacheManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CacheManager, cacheManager };
}
