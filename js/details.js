// ============================================
// DETAILS.JS - PAGE DE DÉTAILS
// ============================================

let currentSeries = null;
let seasons = [];

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seriesId = urlParams.get('id');

    if (!seriesId) {
        window.location.href = 'index.html';
        return;
    }

    await loadSeriesDetails(seriesId);
    await loadSimilarContent(seriesId);
    await initComments(seriesId);
});

async function loadSeriesDetails(seriesId) {
    try {
        // Charger les détails de la série
        currentSeries = await getContentById(seriesId);

        if (!currentSeries) {
            alert('Série introuvable');
            window.location.href = 'index.html';
            return;
        }

        // Charger les saisons
        seasons = await getSeasons(seriesId);

        // Afficher les détails
        renderDetails();
        renderSeasons();
        await setupActions();

    } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
    }
}

function renderDetails() {
    // Backdrop
    document.getElementById('hero-backdrop').style.backgroundImage =
        `url('${currentSeries.backdrop_url || currentSeries.poster_url}')`;

    // Poster
    document.getElementById('poster').src = currentSeries.poster_url || 'https://via.placeholder.com/300x450';
    document.getElementById('poster').alt = currentSeries.title;

    // Titre
    document.getElementById('title').textContent = currentSeries.title;

    // Métadonnées
    document.getElementById('year').textContent = currentSeries.year || 'N/A';
    document.getElementById('type').textContent = currentSeries.type.toUpperCase();
    document.getElementById('rating').textContent = `⭐ ${currentSeries.rating || 'N/A'}`;

    // Genres
    const genresContainer = document.getElementById('genres');
    if (currentSeries.genres && currentSeries.genres.length > 0) {
        genresContainer.innerHTML = currentSeries.genres.map(genre => `
            <span style="
                padding: var(--spacing-xs) var(--spacing-sm);
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-md);
                font-size: var(--font-size-sm);
            ">${genre}</span>
        `).join('');
    }

    // Description
    document.getElementById('description').textContent = currentSeries.description || 'Aucune description disponible.';
}

function renderSeasons() {
    const container = document.getElementById('seasons-container');

    if (seasons.length === 0) {
        container.innerHTML = `
            <p style="color: var(--text-secondary); grid-column: 1 / -1;">
                Aucune saison disponible pour le moment
            </p>
        `;
        return;
    }

    container.innerHTML = seasons.map(season => {
        // Générer le nom d'affichage : utiliser display_name ou générer "Saison X"
        let displayName = season.display_name;

        // Si display_name est vide, null, ou juste un numéro, générer "Saison X"
        if (!displayName || displayName.trim() === '' || !isNaN(displayName)) {
            displayName = `Saison ${season.season_number}`;
        }

        return `
        <div 
            class="glass-card-ultra hover-lift" 
            style="
                padding: var(--spacing-md);
                cursor: pointer;
                transition: all var(--transition-base);
                text-align: center;
            "
            onclick="goToWatch('${season.id}')"
        >
            <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-xs);">
                ${displayName}
            </h3>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                Cliquez pour regarder
            </p>
        </div>
    `}).join('');
}

async function goToWatch(seasonId) {
    try {
        // Récupérer le premier épisode de la saison
        const episodes = await getEpisodes(seasonId);

        if (episodes.length === 0) {
            alert('Aucun épisode disponible pour cette saison');
            return;
        }

        // Rediriger vers le lecteur avec le premier épisode
        window.location.href = `watch.html?episode=${episodes[0].id}`;

    } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        alert('Une erreur est survenue');
    }
}

async function setupActions() {
    const btnFavorite = document.getElementById('btn-favorite');
    const btnWatchlist = document.getElementById('btn-watchlist');

    // Vérifier l'état actuel
    await updateButtonStates();

    // Favoris
    btnFavorite.addEventListener('click', async () => {
        const isFav = await isInFavorites(currentSeries.id);

        if (isFav) {
            const result = await removeFromFavorites(currentSeries.id);
            alert(result.message);
        } else {
            const result = await addToFavorites(currentSeries.id);
            alert(result.message);
        }

        await updateButtonStates();
    });

    // Watchlist
    btnWatchlist.addEventListener('click', async () => {
        const isInList = await isInWatchlistCheck(currentSeries.id);

        if (isInList) {
            const result = await removeFromWatchlist(currentSeries.id);
            alert(result.message);
        } else {
            const result = await addToWatchlist(currentSeries.id);
            alert(result.message);
        }

        await updateButtonStates();
    });
}

async function isInWatchlistCheck(contentId) {
    const userId = getUserId();

    try {
        const { data, error } = await supabase
            .from('user_watchlist')
            .select('id')
            .eq('user_id', userId)
            .eq('content_id', contentId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return false;
    }
}

async function updateButtonStates() {
    const btnFavorite = document.getElementById('btn-favorite');
    const btnWatchlist = document.getElementById('btn-watchlist');

    const isFav = await isInFavorites(currentSeries.id);
    const isInList = await isInWatchlistCheck(currentSeries.id);

    if (isFav) {
        btnFavorite.innerHTML = '<span>⭐ Dans les favoris</span>';
        btnFavorite.classList.add('btn-primary');
        btnFavorite.classList.remove('btn-secondary');
    } else {
        btnFavorite.innerHTML = '<span>⭐ Ajouter aux favoris</span>';
        btnFavorite.classList.add('btn-secondary');
        btnFavorite.classList.remove('btn-primary');
    }

    if (isInList) {
        btnWatchlist.innerHTML = '<span>👁️ Dans la watchlist</span>';
        btnWatchlist.classList.add('btn-primary');
        btnWatchlist.classList.remove('btn-secondary');
    } else {
        btnWatchlist.innerHTML = '<span>👁️ Ajouter à la watchlist</span>';
        btnWatchlist.classList.add('btn-secondary');
        btnWatchlist.classList.remove('btn-primary');
    }
}

// Get similar content based on genres
async function getSimilarContent(contentId) {
    try {
        const { data, error } = await supabase
            .from('series')
            .select('*')
            .neq('id', contentId)
            .limit(100);

        if (error) throw error;

        // Filter by matching genres
        const current = await getContentById(contentId);
        if (!current || !current.genres || current.genres.length === 0) {
            return data.slice(0, 8);
        }

        const similar = data.filter(item => {
            if (!item.genres || item.genres.length === 0) return false;
            // Check if at least one genre matches
            return item.genres.some(genre => current.genres.includes(genre));
        });

        return similar.slice(0, 8);
    } catch (error) {
        console.error('Error fetching similar content:', error);
        return [];
    }
}

async function loadSimilarContent(contentId) {
    const container = document.getElementById('similar-content');
    if (!container) return;

    container.innerHTML = '<p style="color: var(--text-secondary);">Chargement...</p>';

    try {
        const similar = await getSimilarContent(contentId);

        if (similar.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Aucun contenu similaire trouvé</p>';
            return;
        }

        container.innerHTML = similar.map(item => `
            <div class="content-card-modern fade-in" onclick="window.location.href='details.html?id=${item.id}'">
                <img 
                    src="${item.poster_url || 'https://via.placeholder.com/300x450'}" 
                    alt="${item.title}"
                    loading="lazy"
                >
                <div class="content-card-overlay">
                    <h3 class="content-card-title">${item.title}</h3>
                    <p class="content-card-meta">
                        ${item.year || ''} • ${item.type?.toUpperCase() || ''} • ⭐ ${item.rating || 'N/A'}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading similar content:', error);
        container.innerHTML = '<p style="color: var(--text-secondary);">Erreur lors du chargement</p>';
    }
}

// Initialize comments
async function initComments(contentId) {
    // Load existing comments
    const comments = await loadComments(contentId);
    renderComments(comments, contentId);

    // Setup submit button
    const submitBtn = document.getElementById('submit-comment');
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const name = nameInput.value;
            const text = textInput.value;

            const result = await addComment(contentId, name, text);

            if (result.success) {
                nameInput.value = '';
                textInput.value = '';
                await refreshComments(contentId);
                alert('✅ Commentaire publié !');
            } else {
                alert('❌ ' + result.message);
            }
        });
    }
}
