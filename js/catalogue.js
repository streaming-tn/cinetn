// ============================================
// CATALOGUE.JS - PAGE CATALOGUE
// ============================================

let allContent = [];
let filteredContent = [];

// Filtres actifs
let activeFilters = {
    type: 'all',
    year: 'all',
    genre: 'all',
    language: 'all',
    search: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    setupFilters();
});

async function loadContent() {
    try {
        allContent = await getAllContent();
        filteredContent = [...allContent];

        // Générer les filtres dynamiques
        generateGenreFilters();
        generateYearFilters();

        // Mettre à jour le compteur
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${filteredContent.length} résultat${filteredContent.length > 1 ? 's' : ''}`;
        }

        renderContent();
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}

function generateGenreFilters() {
    const genreContainer = document.getElementById('genre-filters');
    if (!genreContainer) return;

    // Extraire tous les genres uniques
    const allGenres = new Set();
    allContent.forEach(item => {
        if (item.genres && Array.isArray(item.genres)) {
            item.genres.forEach(genre => allGenres.add(genre));
        }
    });

    // Garder le bouton "Tous" et ajouter les autres genres
    const genreButtons = Array.from(allGenres).sort().map(genre => `
        <button class="filter-pill" data-genre="${genre}">${genre}</button>
    `).join('');

    genreContainer.innerHTML = `
        <button class="filter-pill active" data-genre="all">Tous</button>
        ${genreButtons}
    `;

    // Réattacher les événements après génération
    attachGenreEvents();
}

function generateYearFilters() {
    const yearContainer = document.getElementById('year-filters');
    if (!yearContainer) return;

    // Extraire toutes les années uniques
    const allYears = new Set();
    allContent.forEach(item => {
        if (item.year) {
            allYears.add(item.year);
        }
    });

    // Trier par ordre décroissant
    const sortedYears = Array.from(allYears).sort((a, b) => b - a);

    const yearButtons = sortedYears.map(year => `
        <button class="filter-pill" data-year="${year}">${year}</button>
    `).join('');

    yearContainer.innerHTML = `
        <button class="filter-pill active" data-year="all">Toutes</button>
        ${yearButtons}
    `;

    // Réattacher les événements après génération
    attachYearEvents();
}

function setupFilters() {
    // Recherche - utiliser le search-input du header
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Filtre type
    attachTypeEvents();

    // Filtre langue
    attachLanguageEvents();

    // Bouton reset
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeFilters = { type: 'all', year: 'all', genre: 'all', language: 'all', search: '' };
            if (searchInput) searchInput.value = '';

            // Réactiver les boutons "Tous"
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('[data-type="all"], [data-genre="all"], [data-year="all"], [data-language="all"]').forEach(b => b.classList.add('active'));

            applyFilters();
        });
    }
}

function attachTypeEvents() {
    document.querySelectorAll('[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.type = btn.dataset.type;
            applyFilters();
        });
    });
}

function attachGenreEvents() {
    document.querySelectorAll('[data-genre]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-genre]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.genre = btn.dataset.genre;
            applyFilters();
        });
    });
}

function attachYearEvents() {
    document.querySelectorAll('[data-year]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-year]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.year = btn.dataset.year;
            applyFilters();
        });
    });
}

function attachLanguageEvents() {
    document.querySelectorAll('[data-language]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-language]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.language = btn.dataset.language;
            applyFilters();
        });
    });
}

async function applyFilters() {
    // Get all content with their available languages
    const contentWithLanguages = await Promise.all(
        allContent.map(async (item) => {
            const languages = await getAvailableLanguages(item.id);
            return { ...item, availableLanguages: languages };
        })
    );

    filteredContent = contentWithLanguages.filter(item => {
        // Filtre type
        const matchesType = activeFilters.type === 'all' || item.type === activeFilters.type;

        // Filtre année
        const matchesYear = activeFilters.year === 'all' || item.year === parseInt(activeFilters.year);

        // Filtre genre
        const matchesGenre = activeFilters.genre === 'all' ||
            (item.genres && item.genres.includes(activeFilters.genre));

        // Filtre langue
        const matchesLanguage = activeFilters.language === 'all' ||
            (item.availableLanguages && item.availableLanguages.includes(activeFilters.language));

        // Filtre recherche
        const matchesSearch = !activeFilters.search ||
            item.title.toLowerCase().includes(activeFilters.search);

        return matchesType && matchesYear && matchesGenre && matchesLanguage && matchesSearch;
    });

    // Mettre à jour le compteur de résultats
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${filteredContent.length} résultat${filteredContent.length > 1 ? 's' : ''}`;
    }

    renderContent();
}

// Fonction pour récupérer les langues disponibles
async function getAvailableLanguages(seriesId) {
    try {
        const seasons = await getSeasons(seriesId);
        const languages = new Set();

        for (const season of seasons) {
            const episodes = await getEpisodes(season.id);
            for (const episode of episodes) {
                if (episode.languages) {
                    Object.keys(episode.languages).forEach(lang => languages.add(lang));
                }
            }
        }

        return Array.from(languages);
    } catch (error) {
        return [];
    }
}

// Fonction pour obtenir le drapeau SVG selon la langue
function getLanguageFlag(lang) {
    const flags = {
        'VF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16">
            <rect width="900" height="600" fill="#ED2939"/>
            <rect width="600" height="600" fill="#fff"/>
            <rect width="300" height="600" fill="#002395"/>
        </svg>`,
        'VOSTFR': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16">
            <!-- Triangle supérieur gauche: Japon -->
            <polygon points="0,0 900,0 0,600" fill="#fff"/>
            <circle cx="225" cy="200" r="100" fill="#BC002D"/>
            <!-- Triangle inférieur droit: France -->
            <polygon points="900,0 900,600 0,600" fill="#ED2939"/>
            <polygon points="900,0 900,600 300,600" fill="#fff"/>
            <polygon points="900,0 900,600 600,600" fill="#002395"/>
        </svg>`,
        'VO': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16">
            <rect width="900" height="600" fill="#fff"/>
            <circle cx="450" cy="300" r="180" fill="#BC002D"/>
        </svg>`,
        'VA': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="24" height="16">
            <rect width="7410" height="3900" fill="#B22234"/>
            <path d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0" stroke="#fff" stroke-width="300"/>
            <rect width="2964" height="2100" fill="#3C3B6E"/>
        </svg>`,
        'VTN': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="24" height="16">
            <rect width="1200" height="800" fill="#E70013"/>
            <circle cx="450" cy="400" r="200" fill="#fff"/>
            <circle cx="500" cy="400" r="160" fill="#E70013"/>
            <path fill="#fff" d="M600,400l-180,120l70-195l-70-195z"/>
        </svg>`,
        'VAR': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16">
            <rect width="900" height="600" fill="#006C35"/>
            <rect y="200" width="900" height="200" fill="#fff"/>
        </svg>`
    };
    return flags[lang] || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="16" fill="#fff">
        <circle cx="12" cy="12" r="10" fill="#4A90E2"/>
        <text x="12" y="16" text-anchor="middle" font-size="12" fill="#fff">🌐</text>
    </svg>`;
}

async function renderContent() {
    const container = document.getElementById('catalogue-grid');

    if (filteredContent.length === 0) {
        container.innerHTML = `
            <p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl);">
                Aucun contenu trouvé
            </p>
        `;
        return;
    }

    // Récupérer les langues pour chaque item
    const itemsWithLanguages = await Promise.all(
        filteredContent.map(async (item) => {
            const languages = await getAvailableLanguages(item.id);
            return { ...item, languages };
        })
    );

    container.innerHTML = itemsWithLanguages.map(item => `
        <div class="content-card-modern fade-in" onclick="window.location.href='details.html?id=${item.id}'">
            ${item.languages && item.languages.length > 0 ? `
                <div class="language-badges">
                    ${item.languages.map(lang => `
                        <div class="language-badge" title="${lang}">
                            ${getLanguageFlag(lang)}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <img 
                src="${item.poster_url || 'https://via.placeholder.com/300x450'}" 
                alt="${item.title}"
                loading="lazy"
            >
            <div class="content-card-overlay">
                <h3 class="content-card-title">${item.title}</h3>
                <p class="content-card-meta">
                    ${item.year || ''} • ${item.type.toUpperCase()} • ⭐ ${item.rating || 'N/A'}
                </p>
            </div>
        </div>
    `).join('');
}
