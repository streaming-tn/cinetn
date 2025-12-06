// ============================================
// PROFILE.JS - USER PROFILE PAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadAllData();
    setupClearButtons();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

async function loadAllData() {
    await loadStatistics();
    await loadHistory();
    await loadFavorites();
    await loadWatchlist();
}

async function loadStatistics() {
    const container = document.getElementById('stats-grid');
    container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Chargement...</p>';

    try {
        const stats = await getUserStatistics();

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.totalWatched}</div>
                <div class="stat-label">Contenus regardés</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalCompleted}</div>
                <div class="stat-label">Contenus terminés</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalWatchTimeFormatted}</div>
                <div class="stat-label">Temps total</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${await getFavoritesCount()}</div>
                <div class="stat-label">Favoris</div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading statistics:', error);
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Erreur lors du chargement</p>';
    }
}

async function getFavoritesCount() {
    const favorites = await getUserFavorites();
    return favorites.length;
}

async function loadHistory() {
    const container = document.getElementById('history-grid');
    container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Chargement...</p>';

    try {
        const history = await getUserWatchHistory(20);

        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">📺</div>
                    <p>Aucun historique pour le moment</p>
                    <p style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">
                        Commencez à regarder du contenu pour voir votre historique ici
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="content-card-modern fade-in" onclick="window.location.href='details.html?id=${item.content_id}'">
                <img 
                    src="${item.series?.poster_url || 'https://via.placeholder.com/300x450'}" 
                    alt="${item.series?.title || 'Contenu'}"
                    loading="lazy"
                >
                <div class="content-card-overlay">
                    <h3 class="content-card-title">${item.series?.title || 'Contenu'}</h3>
                    <p class="content-card-meta">
                        ${item.series?.year || ''} • ${item.series?.type?.toUpperCase() || ''} • ⭐ ${item.series?.rating || 'N/A'}
                    </p>
                    ${item.watch_progress > 0 ? `
                        <div style="margin-top: var(--spacing-xs); font-size: var(--font-size-sm);">
                            ⏱️ ${formatTime(item.watch_progress)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Erreur lors du chargement</p>';
    }
}

async function loadFavorites() {
    const container = document.getElementById('favorites-grid');
    container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Chargement...</p>';

    try {
        const favorites = await getUserFavorites();

        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">⭐</div>
                    <p>Aucun favori pour le moment</p>
                    <p style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">
                        Ajoutez des contenus à vos favoris depuis leur page de détails
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = favorites.map(item => `
            <div class="content-card-modern fade-in" onclick="window.location.href='details.html?id=${item.content_id}'">
                <img 
                    src="${item.series?.poster_url || 'https://via.placeholder.com/300x450'}" 
                    alt="${item.series?.title || 'Contenu'}"
                    loading="lazy"
                >
                <div class="content-card-overlay">
                    <h3 class="content-card-title">${item.series?.title || 'Contenu'}</h3>
                    <p class="content-card-meta">
                        ${item.series?.year || ''} • ${item.series?.type?.toUpperCase() || ''} • ⭐ ${item.series?.rating || 'N/A'}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading favorites:', error);
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Erreur lors du chargement</p>';
    }
}

async function loadWatchlist() {
    const container = document.getElementById('watchlist-grid');
    container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Chargement...</p>';

    try {
        const watchlist = await getUserWatchlist();

        if (watchlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">👁️</div>
                    <p>Watchlist vide</p>
                    <p style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">
                        Ajoutez des contenus à regarder plus tard depuis leur page de détails
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = watchlist.map(item => `
            <div class="content-card-modern fade-in" onclick="window.location.href='details.html?id=${item.content_id}'">
                <img 
                    src="${item.series?.poster_url || 'https://via.placeholder.com/300x450'}" 
                    alt="${item.series?.title || 'Contenu'}"
                    loading="lazy"
                >
                <div class="content-card-overlay">
                    <h3 class="content-card-title">${item.series?.title || 'Contenu'}</h3>
                    <p class="content-card-meta">
                        ${item.series?.year || ''} • ${item.series?.type?.toUpperCase() || ''} • ⭐ ${item.series?.rating || 'N/A'}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading watchlist:', error);
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Erreur lors du chargement</p>';
    }
}

function setupClearButtons() {
    document.getElementById('clear-history').addEventListener('click', async () => {
        if (!confirm('Voulez-vous vraiment vider votre historique ?')) return;

        try {
            const userId = getUserId();
            const { error } = await supabase
                .from('user_activity')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            alert('✅ Historique vidé');
            await loadHistory();
            await loadStatistics();
        } catch (error) {
            console.error('Error clearing history:', error);
            alert('❌ Erreur lors de la suppression');
        }
    });

    document.getElementById('clear-favorites').addEventListener('click', async () => {
        if (!confirm('Voulez-vous vraiment vider vos favoris ?')) return;

        try {
            const userId = getUserId();
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            alert('✅ Favoris vidés');
            await loadFavorites();
            await loadStatistics();
        } catch (error) {
            console.error('Error clearing favorites:', error);
            alert('❌ Erreur lors de la suppression');
        }
    });

    document.getElementById('clear-watchlist').addEventListener('click', async () => {
        if (!confirm('Voulez-vous vraiment vider votre watchlist ?')) return;

        try {
            const userId = getUserId();
            const { error } = await supabase
                .from('user_watchlist')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            alert('✅ Watchlist vidée');
            await loadWatchlist();
        } catch (error) {
            console.error('Error clearing watchlist:', error);
            alert('❌ Erreur lors de la suppression');
        }
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
}
