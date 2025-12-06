// ============================================
// MANAGE-HIERARCHY.JS - GESTION HIÉRARCHIQUE
// ============================================

let currentSeries = null;
let currentSeason = null;
let currentEpisode = null;
let editMode = null;
let editId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    await loadSeriesList();
    setupSearchFilter();
    setupForms();
});

// ============================================
// NIVEAU 1 : SÉRIES
// ============================================

async function loadSeriesList() {
    try {
        const allSeries = await getAllContent();
        renderSeriesList(allSeries);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function renderSeriesList(series) {
    const container = document.getElementById('series-list');

    if (series.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Aucune série disponible</p>';
        return;
    }

    container.innerHTML = series.map(s => `
        <div class="hierarchy-item" onclick="selectSeries('${s.id}', '${s.title.replace(/'/g, "\\'")}')">
            <div class="hierarchy-item-info">
                <strong>${s.title}</strong>
                <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                    ${s.type.toUpperCase()} • ${s.year || 'N/A'}
                </p>
            </div>
            <div class="hierarchy-item-actions">
                <button class="action-btn">Gérer →</button>
            </div>
        </div>
    `).join('');
}

function setupSearchFilter() {
    document.getElementById('series-search').addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        const allSeries = await getAllContent();
        const filtered = allSeries.filter(s => s.title.toLowerCase().includes(query));
        renderSeriesList(filtered);
    });
}

async function selectSeries(id, title) {
    currentSeries = { id, title };

    // Mettre à jour breadcrumb
    document.getElementById('breadcrumb-series').textContent = `📺 ${title}`;
    document.getElementById('breadcrumb-series').classList.add('active');
    document.getElementById('breadcrumb-arrow-1').style.display = 'inline';
    document.getElementById('breadcrumb-season').style.display = 'flex';
    document.getElementById('breadcrumb-season').classList.add('active');

    // Afficher niveau saisons
    document.getElementById('level-series').style.display = 'none';
    document.getElementById('level-seasons').style.display = 'block';

    await loadSeasonsList();
}

function goBackToSeries() {
    currentSeries = null;
    currentSeason = null;
    currentEpisode = null;

    // Réinitialiser breadcrumb
    document.getElementById('breadcrumb-series').textContent = '📺 Sélectionner une série';
    document.getElementById('breadcrumb-series').classList.remove('active');
    document.getElementById('breadcrumb-arrow-1').style.display = 'none';
    document.getElementById('breadcrumb-season').style.display = 'none';
    document.getElementById('breadcrumb-arrow-2').style.display = 'none';
    document.getElementById('breadcrumb-episode').style.display = 'none';

    // Afficher niveau séries
    document.getElementById('level-series').style.display = 'block';
    document.getElementById('level-seasons').style.display = 'none';
    document.getElementById('level-episodes').style.display = 'none';
    document.getElementById('level-links').style.display = 'none';
}

// ============================================
// NIVEAU 2 : SAISONS
// ============================================

async function loadSeasonsList() {
    try {
        const seasons = await getSeasons(currentSeries.id);
        renderSeasonsList(seasons);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function renderSeasonsList(seasons) {
    const container = document.getElementById('seasons-list');

    if (seasons.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Aucune saison. Cliquez sur "Ajouter Saison"</p>';
        return;
    }

    container.innerHTML = seasons.map(season => `
        <div class="hierarchy-item">
            <div class="hierarchy-item-info">
                <strong>${season.display_name}</strong>
                <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                    Numéro: ${season.season_number}
                </p>
            </div>
            <div class="hierarchy-item-actions">
                <button class="action-btn" onclick="selectSeason('${season.id}', '${season.display_name.replace(/'/g, "\\'")}')">
                    📂 Épisodes
                </button>
                <button class="action-btn" onclick="editSeason('${season.id}', ${season.season_number}, '${season.display_name.replace(/'/g, "\\'")}')">
                    ✏️ Modifier
                </button>
                <button class="action-btn" onclick="deleteSeason('${season.id}', '${season.display_name.replace(/'/g, "\\'")}')">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

function openAddSeasonModal() {
    editMode = null;
    document.getElementById('season-modal-title').textContent = 'Ajouter une Saison';
    document.getElementById('season-form').reset();
    document.getElementById('season-modal').classList.add('active');
}

function editSeason(id, number, displayName) {
    editMode = 'edit';
    editId = id;
    document.getElementById('season-modal-title').textContent = 'Modifier la Saison';
    document.getElementById('season-number').value = number;
    document.getElementById('season-display-name').value = displayName;
    document.getElementById('season-modal').classList.add('active');
}

function closeSeasonModal() {
    document.getElementById('season-modal').classList.remove('active');
    editMode = null;
    editId = null;
}

async function deleteSeason(id, name) {
    if (!confirm(`Supprimer "${name}" et tous ses épisodes ?`)) return;

    try {
        const { error } = await supabase.from('seasons').delete().eq('id', id);
        if (error) throw error;

        alert('✅ Saison supprimée');
        await loadSeasonsList();
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression');
    }
}

async function selectSeason(id, displayName) {
    currentSeason = { id, displayName };

    // Mettre à jour breadcrumb
    document.getElementById('breadcrumb-season').textContent = `📁 ${displayName}`;
    document.getElementById('breadcrumb-arrow-2').style.display = 'inline';
    document.getElementById('breadcrumb-episode').style.display = 'flex';
    document.getElementById('breadcrumb-episode').classList.add('active');

    // Afficher niveau épisodes
    document.getElementById('level-seasons').style.display = 'none';
    document.getElementById('level-episodes').style.display = 'block';

    await loadEpisodesList();
}

function goBackToSeasons() {
    currentSeason = null;
    currentEpisode = null;

    // Réinitialiser breadcrumb
    document.getElementById('breadcrumb-season').classList.remove('active');
    document.getElementById('breadcrumb-arrow-2').style.display = 'none';
    document.getElementById('breadcrumb-episode').style.display = 'none';

    // Afficher niveau saisons
    document.getElementById('level-seasons').style.display = 'block';
    document.getElementById('level-episodes').style.display = 'none';
    document.getElementById('level-links').style.display = 'none';
}

// ============================================
// NIVEAU 3 : ÉPISODES
// ============================================

async function loadEpisodesList() {
    try {
        const episodes = await getEpisodes(currentSeason.id);
        renderEpisodesList(episodes);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function renderEpisodesList(episodes) {
    const container = document.getElementById('episodes-list');

    if (episodes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Aucun épisode. Cliquez sur "Ajouter Épisode"</p>';
        return;
    }

    container.innerHTML = episodes.map(ep => {
        const linkCount = countLinks(ep.languages);
        return `
            <div class="hierarchy-item">
                <div class="hierarchy-item-info">
                    <strong>Épisode ${ep.episode_number}${ep.title !== 'Episode' ? ' - ' + ep.title : ''}</strong>
                    <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                        ${linkCount} lien(s) disponible(s)
                    </p>
                </div>
                <div class="hierarchy-item-actions">
                    <button class="action-btn" onclick='selectEpisode(${JSON.stringify(ep).replace(/'/g, "&#39;")})'>
                        🔗 Liens
                    </button>
                    <button class="action-btn" onclick="editEpisode('${ep.id}', ${ep.episode_number}, '${(ep.title || '').replace(/'/g, "\\'")}')">
                        ✏️ Modifier
                    </button>
                    <button class="action-btn" onclick="deleteEpisode('${ep.id}', ${ep.episode_number})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function countLinks(languages) {
    if (!languages) return 0;
    let count = 0;
    Object.values(languages).forEach(links => {
        count += Array.isArray(links) ? links.length : 0;
    });
    return count;
}

function openAddEpisodeModal() {
    editMode = null;
    document.getElementById('episode-modal-title').textContent = 'Ajouter un Épisode';
    document.getElementById('episode-form').reset();
    document.getElementById('episode-modal').classList.add('active');
}

function editEpisode(id, number, title) {
    editMode = 'edit';
    editId = id;
    document.getElementById('episode-modal-title').textContent = 'Modifier l\'Épisode';
    document.getElementById('episode-number').value = number;
    document.getElementById('episode-title').value = title;
    document.getElementById('episode-modal').classList.add('active');
}

function closeEpisodeModal() {
    document.getElementById('episode-modal').classList.remove('active');
    editMode = null;
    editId = null;
}

async function deleteEpisode(id, number) {
    if (!confirm(`Supprimer l'épisode ${number} ?`)) return;

    try {
        const { error } = await supabase.from('episodes').delete().eq('id', id);
        if (error) throw error;

        alert('✅ Épisode supprimé');
        await loadEpisodesList();
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression');
    }
}

function selectEpisode(episode) {
    currentEpisode = episode;

    // Mettre à jour breadcrumb
    document.getElementById('breadcrumb-episode').textContent = `🎬 Épisode ${episode.episode_number}`;

    // Afficher niveau liens
    document.getElementById('level-episodes').style.display = 'none';
    document.getElementById('level-links').style.display = 'block';

    renderLinksList();
}

function goBackToEpisodes() {
    currentEpisode = null;

    // Afficher niveau épisodes
    document.getElementById('level-episodes').style.display = 'block';
    document.getElementById('level-links').style.display = 'none';
}

// ============================================
// NIVEAU 4 : LIENS
// ============================================

function renderLinksList() {
    const container = document.getElementById('links-list');
    const languages = currentEpisode.languages || {};

    if (Object.keys(languages).length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Aucun lien. Cliquez sur "Ajouter Lien"</p>';
        return;
    }

    let html = '';

    Object.entries(languages).forEach(([lang, links]) => {
        html += `
            <div style="margin-bottom: var(--spacing-lg);">
                <h3 style="margin-bottom: var(--spacing-sm);">${lang} - ${links.length} lien(s)</h3>
                ${links.map((link, index) => `
                    <div class="link-item">
                        <div style="flex: 1;">
                            <strong>${link.server || 'Lecteur ' + (index + 1)}</strong>
                            <div class="link-item-url">${link.link}</div>
                        </div>
                        <div style="display: flex; gap: var(--spacing-xs);">
                            <button class="action-btn" onclick='editLink("${lang}", "${link.id}", "${link.server.replace(/'/g, "\\'")}","${link.link.replace(/'/g, "\\'")}")'>
                                ✏️
                            </button>
                            <button class="action-btn" onclick='deleteLink("${lang}", "${link.id}")'>
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });

    container.innerHTML = html;
}

function openAddLinkModal() {
    editMode = null;
    document.getElementById('link-modal-title').textContent = 'Ajouter un Lien';
    document.getElementById('link-form').reset();
    document.getElementById('link-modal').classList.add('active');
}

function editLink(lang, linkId, server, url) {
    editMode = 'edit';
    editId = { lang, linkId };
    document.getElementById('link-modal-title').textContent = 'Modifier le Lien';
    document.getElementById('link-language').value = lang;
    document.getElementById('link-server').value = server;
    document.getElementById('link-url').value = url;
    document.getElementById('link-modal').classList.add('active');
}

function closeLinkModal() {
    document.getElementById('link-modal').classList.remove('active');
    editMode = null;
    editId = null;
}

async function deleteLink(lang, linkId) {
    if (!confirm('Supprimer ce lien ?')) return;

    try {
        const languages = { ...currentEpisode.languages };
        languages[lang] = languages[lang].filter(l => l.id !== linkId);

        if (languages[lang].length === 0) {
            delete languages[lang];
        }

        const { error } = await supabase
            .from('episodes')
            .update({ languages })
            .eq('id', currentEpisode.id);

        if (error) throw error;

        currentEpisode.languages = languages;
        alert('✅ Lien supprimé');
        renderLinksList();
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression');
    }
}

// ============================================
// FORMULAIRES
// ============================================

function setupForms() {
    // Formulaire saison
    document.getElementById('season-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const seasonNumber = parseInt(document.getElementById('season-number').value);
        let displayName = document.getElementById('season-display-name').value.trim();

        // Si le nom d'affichage est vide, générer automatiquement "Saison X"
        if (!displayName) {
            displayName = `Saison ${seasonNumber}`;
        }

        const data = {
            series_id: currentSeries.id,
            season_number: seasonNumber,
            display_name: displayName
        };

        try {
            if (editMode === 'edit') {
                const { error } = await supabase.from('seasons').update(data).eq('id', editId);
                if (error) throw error;
                alert('✅ Saison modifiée');
            } else {
                const { error } = await supabase.from('seasons').insert([data]);
                if (error) throw error;
                alert('✅ Saison ajoutée');
            }

            closeSeasonModal();
            await loadSeasonsList();
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur');
        }
    });

    // Formulaire épisode
    document.getElementById('episode-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            season_id: currentSeason.id,
            episode_number: parseInt(document.getElementById('episode-number').value),
            title: document.getElementById('episode-title').value || 'Episode',
            languages: {}
        };

        try {
            if (editMode === 'edit') {
                const { error } = await supabase.from('episodes').update(data).eq('id', editId);
                if (error) throw error;
                alert('✅ Épisode modifié');
            } else {
                const { error } = await supabase.from('episodes').insert([data]);
                if (error) throw error;
                alert('✅ Épisode ajouté');
            }

            closeEpisodeModal();
            await loadEpisodesList();
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur');
        }
    });

    // Formulaire lien
    document.getElementById('link-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const lang = document.getElementById('link-language').value;
        const server = document.getElementById('link-server').value;
        const url = document.getElementById('link-url').value;

        try {
            const languages = { ...currentEpisode.languages };

            if (editMode === 'edit') {
                // Modifier
                const linkIndex = languages[editId.lang].findIndex(l => l.id === editId.linkId);
                languages[editId.lang][linkIndex] = {
                    id: editId.linkId,
                    server,
                    link: url,
                    date: new Date().toISOString().split('T')[0]
                };
            } else {
                // Ajouter
                if (!languages[lang]) languages[lang] = [];
                languages[lang].push({
                    id: generateUUID(),
                    server,
                    link: url,
                    date: new Date().toISOString().split('T')[0]
                });
            }

            const { error } = await supabase
                .from('episodes')
                .update({ languages })
                .eq('id', currentEpisode.id);

            if (error) throw error;

            currentEpisode.languages = languages;
            alert('✅ Lien enregistré');
            closeLinkModal();
            renderLinksList();
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur');
        }
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
