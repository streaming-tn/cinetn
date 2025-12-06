// ============================================
// MANAGE-CONTENT.JS - GESTION DU CONTENU
// ============================================

let allContent = [];
let filteredContent = [];
let currentSeriesId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    await loadContent();
    setupFilters();
});

async function loadContent() {
    try {
        allContent = await getAllContent();
        filteredContent = [...allContent];
        renderTable();
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}

function setupFilters() {
    // Recherche
    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        applyFilters(query, document.getElementById('type-filter').value);
    });

    // Filtre type
    document.getElementById('type-filter').addEventListener('change', (e) => {
        const query = document.getElementById('search-input').value.toLowerCase();
        applyFilters(query, e.target.value);
    });
}

function applyFilters(searchQuery, typeFilter) {
    filteredContent = allContent.filter(item => {
        const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery);
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    renderTable();
}

async function renderTable() {
    const tbody = document.getElementById('content-tbody');

    if (filteredContent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">
                    Aucun contenu trouvé
                </td>
            </tr>
        `;
        return;
    }

    // Récupérer le nombre de saisons pour chaque série
    const contentWithSeasons = await Promise.all(
        filteredContent.map(async (item) => {
            const seasons = await getSeasons(item.id);
            return { ...item, seasonsCount: seasons.length };
        })
    );

    tbody.innerHTML = contentWithSeasons.map(item => `
        <tr>
            <td>
                <img 
                    src="${item.poster_url || 'https://via.placeholder.com/50x75'}" 
                    alt="${item.title}"
                    class="content-poster-small"
                >
            </td>
            <td><strong>${item.title}</strong></td>
            <td>
                <span style="
                    padding: var(--spacing-xs) var(--spacing-sm);
                    background: var(--bg-tertiary);
                    border-radius: var(--border-radius-sm);
                    font-size: var(--font-size-sm);
                ">
                    ${item.type.toUpperCase()}
                </span>
            </td>
            <td>${item.year || 'N/A'}</td>
            <td>⭐ ${item.rating || 'N/A'}</td>
            <td>${item.seasonsCount} saison(s)</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="openSeasonsModal('${item.id}', '${item.title.replace(/'/g, "\\'")}')">
                        📁 Saisons
                    </button>
                    <button class="action-btn" onclick="openEditModal('${item.id}')">
                        ✏️ Modifier
                    </button>
                    <button class="action-btn" onclick="viewContent('${item.id}')">
                        👁️ Voir
                    </button>
                    <button class="action-btn" onclick="deleteContent('${item.id}', '${item.title.replace(/'/g, "\\'")}')">
                        🗑️ Supprimer
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function openSeasonsModal(seriesId, seriesTitle) {
    currentSeriesId = seriesId;
    const modal = document.getElementById('seasons-modal');
    const content = document.getElementById('seasons-content');

    modal.classList.add('active');
    content.innerHTML = '<p style="color: var(--text-secondary);">Chargement...</p>';

    try {
        const seasons = await getSeasons(seriesId);

        if (seasons.length === 0) {
            content.innerHTML = '<p style="color: var(--text-secondary);">Aucune saison pour le moment</p>';
        } else {
            content.innerHTML = `
                <h3 style="margin-bottom: var(--spacing-md);">${seriesTitle}</h3>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                    ${seasons.map(season => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: var(--spacing-md);
                            background: var(--bg-tertiary);
                            border-radius: var(--border-radius-md);
                        ">
                            <div>
                                <strong>${season.display_name}</strong>
                                <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                                    Numéro: ${season.season_number}
                                </p>
                            </div>
                            <button 
                                class="action-btn" 
                                onclick="deleteSeason('${season.id}', '${season.display_name.replace(/'/g, "\\'")}')">
                                🗑️ Supprimer
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Erreur:', error);
        content.innerHTML = '<p style="color: #ff6b6b;">Erreur lors du chargement des saisons</p>';
    }

    // Setup form
    document.getElementById('add-season-form').onsubmit = handleAddSeason;
}

function closeSeasonsModal() {
    document.getElementById('seasons-modal').classList.remove('active');
    currentSeriesId = null;
    document.getElementById('add-season-form').reset();
}

async function handleAddSeason(e) {
    e.preventDefault();

    const seasonNumber = parseInt(document.getElementById('season-number').value);
    let displayName = document.getElementById('season-display-name').value.trim();

    // Si le nom d'affichage est vide, générer automatiquement "Saison X"
    if (!displayName) {
        displayName = `Saison ${seasonNumber}`;
    }

    try {
        const { error } = await supabase
            .from('seasons')
            .insert([{
                series_id: currentSeriesId,
                season_number: seasonNumber,
                display_name: displayName
            }]);

        if (error) throw error;

        alert('✅ Saison ajoutée avec succès !');

        // Recharger les saisons
        const seriesTitle = filteredContent.find(c => c.id === currentSeriesId)?.title || '';
        openSeasonsModal(currentSeriesId, seriesTitle);

        // Reset form
        document.getElementById('add-season-form').reset();

    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de l\'ajout de la saison');
    }
}

async function deleteSeason(seasonId, seasonName) {
    const confirmed = confirm(`Supprimer "${seasonName}" et TOUS ses épisodes ?`);
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('seasons')
            .delete()
            .eq('id', seasonId);

        if (error) throw error;

        alert('✅ Saison supprimée');

        // Recharger
        const seriesTitle = filteredContent.find(c => c.id === currentSeriesId)?.title || '';
        openSeasonsModal(currentSeriesId, seriesTitle);

    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression');
    }
}

function viewContent(id) {
    window.open(`../details.html?id=${id}`, '_blank');
}

async function deleteContent(id, title) {
    const confirmed = confirm(`Supprimer "${title}" et TOUTES ses saisons/épisodes ?`);
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('series')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('✅ Contenu supprimé');
        await loadContent();

    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression');
    }
}

// ============================================
// EDIT CONTENT FUNCTIONS
// ============================================

let currentEditId = null;

async function openEditModal(contentId) {
    currentEditId = contentId;
    const modal = document.getElementById('edit-modal');

    // Find content in allContent array
    const content = allContent.find(c => c.id === contentId);
    if (!content) {
        alert('❌ Contenu introuvable');
        return;
    }

    // Populate form fields
    document.getElementById('edit-title').value = content.title || '';
    document.getElementById('edit-description').value = content.description || '';
    document.getElementById('edit-type').value = content.type || 'anime';
    document.getElementById('edit-year').value = content.year || '';
    document.getElementById('edit-rating').value = content.rating || '';
    document.getElementById('edit-genres').value = content.genres ? content.genres.join(', ') : '';
    document.getElementById('edit-poster').value = content.poster_url || '';
    document.getElementById('edit-backdrop').value = content.backdrop_url || '';

    // Show modal
    modal.classList.add('active');

    // Setup form submit
    document.getElementById('edit-content-form').onsubmit = handleEditContent;
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
    currentEditId = null;
    document.getElementById('edit-content-form').reset();
}

async function handleEditContent(e) {
    e.preventDefault();

    if (!currentEditId) return;

    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-description').value.trim();
    const type = document.getElementById('edit-type').value;
    const year = document.getElementById('edit-year').value;
    const rating = document.getElementById('edit-rating').value;
    const genresInput = document.getElementById('edit-genres').value.trim();
    const posterUrl = document.getElementById('edit-poster').value.trim();
    const backdropUrl = document.getElementById('edit-backdrop').value.trim();

    // Parse genres
    const genres = genresInput ? genresInput.split(',').map(g => g.trim()).filter(g => g) : [];

    try {
        const updateData = {
            title,
            description,
            type,
            genres
        };

        // Add optional fields only if they have values
        if (year) updateData.year = parseInt(year);
        if (rating) updateData.rating = parseFloat(rating);
        if (posterUrl) updateData.poster_url = posterUrl;
        if (backdropUrl) updateData.backdrop_url = backdropUrl;

        const { error } = await supabase
            .from('series')
            .update(updateData)
            .eq('id', currentEditId);

        if (error) throw error;

        alert('✅ Contenu modifié avec succès !');
        closeEditModal();
        await loadContent();

    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la modification');
    }
}

