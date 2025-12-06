// ============================================
// USER-TRACKING.JS - USER ACTIVITY TRACKING
// ============================================

// Generate or retrieve user ID
function getUserId() {
    let userId = localStorage.getItem('cinetn_user_id');

    if (!userId) {
        // Generate unique user ID (simple fingerprint)
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cinetn_user_id', userId);
    }

    return userId;
}

// Track watch progress
async function trackWatchProgress(contentId, episodeId = null, watchProgress = 0, completed = false) {
    const userId = getUserId();

    try {
        // Check if activity exists
        const { data: existing } = await supabase
            .from('user_activity')
            .select('id')
            .eq('user_id', userId)
            .eq('content_id', contentId)
            .eq('episode_id', episodeId)
            .single();

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('user_activity')
                .update({
                    watch_progress: watchProgress,
                    last_watched: new Date().toISOString(),
                    completed: completed
                })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('user_activity')
                .insert([{
                    user_id: userId,
                    content_id: contentId,
                    episode_id: episodeId,
                    watch_progress: watchProgress,
                    completed: completed
                }]);

            if (error) throw error;
        }

        return true;
    } catch (error) {
        console.error('Error tracking watch progress:', error);
        return false;
    }
}

// Get user watch history
async function getUserWatchHistory(limit = 20) {
    const userId = getUserId();

    try {
        const { data, error } = await supabase
            .from('user_activity')
            .select(`
                *,
                series:content_id (
                    id,
                    title,
                    poster_url,
                    type,
                    year,
                    rating
                )
            `)
            .eq('user_id', userId)
            .order('last_watched', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching watch history:', error);
        return [];
    }
}

// Add to favorites
async function addToFavorites(contentId) {
    const userId = getUserId();

    try {
        const { error } = await supabase
            .from('user_favorites')
            .insert([{
                user_id: userId,
                content_id: contentId
            }]);

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return { success: false, message: 'Déjà dans les favoris' };
            }
            throw error;
        }

        return { success: true, message: 'Ajouté aux favoris !' };
    } catch (error) {
        console.error('Error adding to favorites:', error);
        return { success: false, message: 'Erreur lors de l\'ajout' };
    }
}

// Remove from favorites
async function removeFromFavorites(contentId) {
    const userId = getUserId();

    try {
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('content_id', contentId);

        if (error) throw error;
        return { success: true, message: 'Retiré des favoris' };
    } catch (error) {
        console.error('Error removing from favorites:', error);
        return { success: false, message: 'Erreur lors de la suppression' };
    }
}

// Get user favorites
async function getUserFavorites() {
    const userId = getUserId();

    try {
        const { data, error } = await supabase
            .from('user_favorites')
            .select(`
                *,
                series:content_id (
                    id,
                    title,
                    poster_url,
                    type,
                    year,
                    rating,
                    genres
                )
            `)
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

// Check if content is in favorites
async function isInFavorites(contentId) {
    const userId = getUserId();

    try {
        const { data, error } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('content_id', contentId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    } catch (error) {
        console.error('Error checking favorites:', error);
        return false;
    }
}

// Add to watchlist
async function addToWatchlist(contentId) {
    const userId = getUserId();

    try {
        const { error } = await supabase
            .from('user_watchlist')
            .insert([{
                user_id: userId,
                content_id: contentId
            }]);

        if (error) {
            if (error.code === '23505') {
                return { success: false, message: 'Déjà dans la watchlist' };
            }
            throw error;
        }

        return { success: true, message: 'Ajouté à la watchlist !' };
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return { success: false, message: 'Erreur lors de l\'ajout' };
    }
}

// Remove from watchlist
async function removeFromWatchlist(contentId) {
    const userId = getUserId();

    try {
        const { error } = await supabase
            .from('user_watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('content_id', contentId);

        if (error) throw error;
        return { success: true, message: 'Retiré de la watchlist' };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return { success: false, message: 'Erreur lors de la suppression' };
    }
}

// Get user watchlist
async function getUserWatchlist() {
    const userId = getUserId();

    try {
        const { data, error } = await supabase
            .from('user_watchlist')
            .select(`
                *,
                series:content_id (
                    id,
                    title,
                    poster_url,
                    type,
                    year,
                    rating,
                    genres
                )
            `)
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
}

// Get user statistics
async function getUserStatistics() {
    const userId = getUserId();

    try {
        const { data: activities, error } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const stats = {
            totalWatched: activities.length,
            totalCompleted: activities.filter(a => a.completed).length,
            totalWatchTime: activities.reduce((sum, a) => sum + (a.watch_progress || 0), 0),
            recentlyWatched: activities.slice(0, 10)
        };

        // Convert seconds to hours:minutes
        const hours = Math.floor(stats.totalWatchTime / 3600);
        const minutes = Math.floor((stats.totalWatchTime % 3600) / 60);
        stats.totalWatchTimeFormatted = `${hours}h ${minutes}min`;

        return stats;
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return {
            totalWatched: 0,
            totalCompleted: 0,
            totalWatchTime: 0,
            totalWatchTimeFormatted: '0h 0min',
            recentlyWatched: []
        };
    }
}

// Increment content view count
async function incrementViewCount(contentId) {
    try {
        const { error } = await supabase.rpc('increment_view_count', {
            content_uuid: contentId
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return false;
    }
}
