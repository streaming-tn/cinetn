// ============================================
// STOCKAGE LOCAL - CINÉ TN
// ============================================

class LocalStorageManager {
    constructor() {
        this.KEYS = {
            HISTORY: 'cinetn_history',
            FAVORITES: 'cinetn_favorites',
            WATCHLIST: 'cinetn_watchlist'
        };
        this.MAX_HISTORY_ITEMS = 100;
    }

    // ============================================
    // HISTORIQUE
    // ============================================

    /**
     * Ajoute un élément à l'historique
     * @param {Object} item - {seriesId, seriesTitle, episodeId, episodeNumber, seasonNumber, timestamp}
     */
    addToHistory(item) {
        try {
            let history = this.getHistory();

            // Supprimer l'élément s'il existe déjà
            history = history.filter(h => h.episodeId !== item.episodeId);

            // Ajouter au début
            history.unshift({
                ...item,
                timestamp: Date.now()
            });

            // Limiter à MAX_HISTORY_ITEMS
            if (history.length > this.MAX_HISTORY_ITEMS) {
                history = history.slice(0, this.MAX_HISTORY_ITEMS);
            }

            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
        } catch (error) {
            console.error('Erreur lors de l\'ajout à l\'historique:', error);
        }
    }

    /**
     * Récupère l'historique
     * @returns {Array}
     */
    getHistory() {
        try {
            const data = localStorage.getItem(this.KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            return [];
        }
    }

    /**
     * Supprime un élément de l'historique
     * @param {string} episodeId
     */
    removeFromHistory(episodeId) {
        try {
            let history = this.getHistory();
            history = history.filter(h => h.episodeId !== episodeId);
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'historique:', error);
        }
    }

    /**
     * Vide l'historique
     */
    clearHistory() {
        localStorage.removeItem(this.KEYS.HISTORY);
    }

    // ============================================
    // FAVORIS
    // ============================================

    /**
     * Ajoute une série aux favoris
     * @param {Object} series - {id, title, poster_url, type}
     */
    addToFavorites(series) {
        try {
            let favorites = this.getFavorites();

            // Vérifier si déjà dans les favoris
            if (favorites.some(f => f.id === series.id)) {
                return false;
            }

            favorites.unshift({
                ...series,
                addedAt: Date.now()
            });

            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout aux favoris:', error);
            return false;
        }
    }

    /**
     * Récupère les favoris
     * @returns {Array}
     */
    getFavorites() {
        try {
            const data = localStorage.getItem(this.KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des favoris:', error);
            return [];
        }
    }

    /**
     * Supprime une série des favoris
     * @param {string} seriesId
     */
    removeFromFavorites(seriesId) {
        try {
            let favorites = this.getFavorites();
            favorites = favorites.filter(f => f.id !== seriesId);
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression des favoris:', error);
            return false;
        }
    }

    /**
     * Vérifie si une série est dans les favoris
     * @param {string} seriesId
     * @returns {boolean}
     */
    isFavorite(seriesId) {
        const favorites = this.getFavorites();
        return favorites.some(f => f.id === seriesId);
    }

    // ============================================
    // WATCHLIST (À voir plus tard)
    // ============================================

    /**
     * Ajoute une série à la watchlist
     * @param {Object} series - {id, title, poster_url, type}
     */
    addToWatchlist(series) {
        try {
            let watchlist = this.getWatchlist();

            // Vérifier si déjà dans la watchlist
            if (watchlist.some(w => w.id === series.id)) {
                return false;
            }

            watchlist.unshift({
                ...series,
                addedAt: Date.now()
            });

            localStorage.setItem(this.KEYS.WATCHLIST, JSON.stringify(watchlist));
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout à la watchlist:', error);
            return false;
        }
    }

    /**
     * Récupère la watchlist
     * @returns {Array}
     */
    getWatchlist() {
        try {
            const data = localStorage.getItem(this.KEYS.WATCHLIST);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération de la watchlist:', error);
            return [];
        }
    }

    /**
     * Supprime une série de la watchlist
     * @param {string} seriesId
     */
    removeFromWatchlist(seriesId) {
        try {
            let watchlist = this.getWatchlist();
            watchlist = watchlist.filter(w => w.id !== seriesId);
            localStorage.setItem(this.KEYS.WATCHLIST, JSON.stringify(watchlist));
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de la watchlist:', error);
            return false;
        }
    }

    /**
     * Vérifie si une série est dans la watchlist
     * @param {string} seriesId
     * @returns {boolean}
     */
    isInWatchlist(seriesId) {
        const watchlist = this.getWatchlist();
        return watchlist.some(w => w.id === seriesId);
    }
}

// Instance globale
const storage = new LocalStorageManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LocalStorageManager, storage };
}
