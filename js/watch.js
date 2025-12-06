// ============================================
// WATCH.JS - PAGE LECTEUR
// ============================================

let currentEpisode = null;
let allEpisodes = [];
let currentSeason = null;
let currentSeries = null;
let selectedLanguage = 'VF';
let selectedPlayerIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const episodeId = urlParams.get('episode');

    if (!episodeId) {
        window.location.href = 'index.html';
        return;
    }

    await loadEpisode(episodeId);
});

async function loadEpisode(episodeId) {
    try {
        // Récupérer l'épisode
        const { data: episode, error } = await supabase
            .from('episodes')
            .select('*, seasons(*, series(*))')
            .eq('id', episodeId)
            .single();

        if (error || !episode) {
            alert('Épisode introuvable');
            window.location.href = 'index.html';
            return;
        }

        currentEpisode = episode;
        currentSeason = episode.seasons;
        currentSeries = episode.seasons.series;

        // Charger tous les épisodes de la saison
        allEpisodes = await getEpisodes(currentSeason.id);

        // Afficher l'interface
        renderUI();
        loadPlayer();

        // Tracker le visionnage avec le nouveau système
        await trackWatchProgress(
            currentSeries.id,
            currentEpisode.id,
            0, // watch_progress initial
            false // not completed yet
        );

        // Incrémenter le compteur de vues
        await incrementViewCount(currentSeries.id);

    } catch (error) {
        console.error('Erreur lors du chargement de l\'épisode:', error);
    }
}

function renderUI() {
    // Titre de la série
    document.getElementById('series-title').textContent = currentSeries.title;
    document.getElementById('back-link').href = `details.html?id=${currentSeries.id}`;

    // Générer le nom d'affichage de la saison
    let seasonDisplayName = currentSeason.display_name;
    if (!seasonDisplayName || seasonDisplayName.trim() === '' || !isNaN(seasonDisplayName)) {
        seasonDisplayName = `Saison ${currentSeason.season_number}`;
    }

    // Titre de l'épisode
    document.getElementById('episode-title').textContent =
        `${seasonDisplayName} - Épisode ${currentEpisode.episode_number}`;

    // Sélecteur de langue
    renderLanguageSelector();

    // Sélecteur d'épisode
    renderEpisodeSelector();

    // Boutons de navigation
    setupNavigationButtons();

    // Paramètres d'ambiance
    setupSettings();
}

function setupSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const settingsArrow = document.getElementById('settings-arrow');
    const autoMarginsCheckbox = document.getElementById('auto-margins');
    const marginOptions = document.getElementById('margin-options');
    const playerIframe = document.getElementById('player-iframe');

    let currentMargin = 32; // Marge par défaut

    // Toggle menu
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = settingsMenu.style.display === 'block';
        settingsMenu.style.display = isOpen ? 'none' : 'block';
        settingsArrow.textContent = isOpen ? '▼' : '▲';
    });

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
            settingsMenu.style.display = 'none';
            settingsArrow.textContent = '▼';
        }
    });

    // Toggle marges automatiques
    autoMarginsCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            marginOptions.style.display = 'block';
            applyMargins(currentMargin);
        } else {
            marginOptions.style.display = 'none';
            applyMargins(0);
        }
    });

    // Boutons de sélection de marge
    document.querySelectorAll('.margin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer active de tous
            document.querySelectorAll('.margin-btn').forEach(b => b.classList.remove('active'));
            // Ajouter active au bouton cliqué
            btn.classList.add('active');

            currentMargin = parseInt(btn.dataset.margin);
            if (autoMarginsCheckbox.checked) {
                applyMargins(currentMargin);
            }
        });
    });

    function applyMargins(margin) {
        const iframeWrapper = document.getElementById('iframe-wrapper');

        if (margin > 0) {
            iframeWrapper.style.padding = `${margin}px`;
            iframeWrapper.style.background = '#000';
        } else {
            iframeWrapper.style.padding = '0';
            iframeWrapper.style.background = 'transparent';
        }
    }
}

function renderLanguageSelector() {
    const container = document.getElementById('language-selector');
    const languages = currentEpisode.languages || {};
    const availableLanguages = Object.keys(languages);

    if (availableLanguages.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Aucune langue disponible</p>';
        return;
    }

    // Sélectionner la première langue disponible si la langue actuelle n'existe pas
    if (!availableLanguages.includes(selectedLanguage)) {
        selectedLanguage = availableLanguages[0];
    }

    container.innerHTML = availableLanguages.map(lang => {
        const langConfig = LANGUAGES[lang] || { name: lang, flag: '' };
        return `
            <button 
                class="language-btn ${lang === selectedLanguage ? 'active' : ''}"
                onclick="selectLanguage('${lang}')"
            >
                ${langConfig.flag ? `<img src="${langConfig.flag}" alt="${lang}" class="language-flag">` : ''}
                <span>${lang}</span>
            </button>
        `;
    }).join('');
}

function selectLanguage(lang) {
    selectedLanguage = lang;
    selectedPlayerIndex = 0;
    renderLanguageSelector();
    renderPlayerSelector();
    loadPlayer();
}

function renderEpisodeSelector() {
    const select = document.getElementById('episode-select');

    select.innerHTML = allEpisodes.map(ep => `
        <option value="${ep.id}" ${ep.id === currentEpisode.id ? 'selected' : ''}>
            Épisode ${ep.episode_number}${ep.title !== 'Episode' ? ' - ' + ep.title : ''}
        </option>
    `).join('');

    select.addEventListener('change', (e) => {
        window.location.href = `watch.html?episode=${e.target.value}`;
    });
}

function renderPlayerSelector() {
    const select = document.getElementById('player-select');
    const languages = currentEpisode.languages || {};
    let players = languages[selectedLanguage] || [];

    if (players.length === 0) {
        select.innerHTML = '<option>Aucun lecteur disponible</option>';
        return;
    }

    // Trier les lecteurs par ordre numérique (Lecteur 1, Lecteur 2, etc.)
    const sortedPlayers = players.map((player, originalIndex) => ({
        ...player,
        originalIndex
    })).sort((a, b) => {
        // Extraire le numéro du nom du lecteur (ex: "Lecteur 3" -> 3)
        const numA = parseInt(a.server?.match(/\d+/)?.[0] || '999');
        const numB = parseInt(b.server?.match(/\d+/)?.[0] || '999');
        return numA - numB;
    });

    select.innerHTML = sortedPlayers.map((player, displayIndex) => `
        <option value="${player.originalIndex}" ${player.originalIndex === selectedPlayerIndex ? 'selected' : ''}>
            ${player.server || `Lecteur ${displayIndex + 1}`}
        </option>
    `).join('');

    select.addEventListener('change', (e) => {
        selectedPlayerIndex = parseInt(e.target.value);
        loadPlayer();
    });
}

function loadPlayer() {
    const iframe = document.getElementById('player-iframe');
    const errorMessage = document.getElementById('error-message');
    const languages = currentEpisode.languages || {};
    const players = languages[selectedLanguage] || [];

    // Cacher le message d'erreur
    errorMessage.style.display = 'none';

    if (players.length === 0 || !players[selectedPlayerIndex]) {
        iframe.src = '';
        errorMessage.style.display = 'block';
        return;
    }

    const playerLink = players[selectedPlayerIndex].link;
    iframe.src = playerLink;

    // Mettre à jour le sélecteur de lecteur
    renderPlayerSelector();

    // Détecter les erreurs de chargement
    iframe.onerror = () => {
        errorMessage.style.display = 'block';
    };
}

function setupNavigationButtons() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnLast = document.getElementById('btn-last');

    // Boutons du haut
    const btnPrevTop = document.getElementById('btn-prev-top');
    const btnNextTop = document.getElementById('btn-next-top');
    const btnLastTop = document.getElementById('btn-last-top');

    const currentIndex = allEpisodes.findIndex(ep => ep.id === currentEpisode.id);

    // Bouton précédent (bas et haut)
    if (currentIndex > 0) {
        const prevAction = () => {
            window.location.href = `watch.html?episode=${allEpisodes[currentIndex - 1].id}`;
        };

        btnPrev.disabled = false;
        btnPrev.onclick = prevAction;

        btnPrevTop.disabled = false;
        btnPrevTop.onclick = prevAction;
    } else {
        btnPrev.disabled = true;
        btnPrev.style.opacity = '0.5';
        btnPrev.style.cursor = 'not-allowed';

        btnPrevTop.disabled = true;
        btnPrevTop.style.opacity = '0.5';
        btnPrevTop.style.cursor = 'not-allowed';
    }

    // Bouton suivant (bas et haut)
    if (currentIndex < allEpisodes.length - 1) {
        const nextAction = () => {
            window.location.href = `watch.html?episode=${allEpisodes[currentIndex + 1].id}`;
        };

        btnNext.disabled = false;
        btnNext.onclick = nextAction;

        btnNextTop.disabled = false;
        btnNextTop.onclick = nextAction;
    } else {
        btnNext.disabled = true;
        btnNext.style.opacity = '0.5';
        btnNext.style.cursor = 'not-allowed';

        btnNextTop.disabled = true;
        btnNextTop.style.opacity = '0.5';
        btnNextTop.style.cursor = 'not-allowed';
    }

    // Bouton dernier épisode (bas et haut)
    const lastAction = () => {
        window.location.href = `watch.html?episode=${allEpisodes[allEpisodes.length - 1].id}`;
    };

    btnLast.onclick = lastAction;
    btnLastTop.onclick = lastAction;
}
