// ============================================
// SUPABASE CLIENT - CINÉ TN
// ============================================

// Initialisation du client Supabase
const supabase = window.supabase.createClient(
    'https://sqflhlqqtjtiyleecfyi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZmxobHFxdGp0aXlsZWVjZnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTMyMzgsImV4cCI6MjA4MDI2OTIzOH0.BvrS4u0TzWho2h8Zv5gVXnjISnFRPNGbrbKqgPqGRrA'
);

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Récupère tous les contenus (séries, animes, films)
 * @param {Object} filters - Filtres optionnels (type, genre, etc.)
 * @returns {Promise<Array>}
 */
async function getAllContent(filters = {}) {
    try {
        let query = supabase
            .from('series')
            .select('*')
            .order('created_at', { ascending: false });

        // Appliquer les filtres
        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (filters.genre) {
            query = query.contains('genres', [filters.genre]);
        }

        if (filters.year) {
            query = query.eq('year', filters.year);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
        return [];
    }
}

/**
 * Récupère un contenu par son ID
 * @param {string} id - ID du contenu
 * @returns {Promise<Object|null>}
 */
async function getContentById(id) {
    try {
        const { data, error } = await supabase
            .from('series')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
        return null;
    }
}

/**
 * Récupère les saisons d'une série
 * @param {string} seriesId - ID de la série
 * @returns {Promise<Array>}
 */
async function getSeasons(seriesId) {
    try {
        const { data, error } = await supabase
            .from('seasons')
            .select('*')
            .eq('series_id', seriesId)
            .order('season_number', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des saisons:', error);
        return [];
    }
}

/**
 * Récupère les épisodes d'une saison
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<Array>}
 */
async function getEpisodes(seasonId) {
    try {
        const { data, error } = await supabase
            .from('episodes')
            .select('*')
            .eq('season_id', seasonId)
            .order('episode_number', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des épisodes:', error);
        return [];
    }
}

/**
 * Recherche de contenu en temps réel
 * @param {string} query - Terme de recherche
 * @returns {Promise<Array>}
 */
async function searchContent(query) {
    try {
        const { data, error } = await supabase
            .from('series')
            .select('*')
            .ilike('title', `%${query}%`)
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        return [];
    }
}

// ============================================
// EXPORT
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabase,
        getAllContent,
        getContentById,
        getSeasons,
        getEpisodes,
        searchContent
    };
}
