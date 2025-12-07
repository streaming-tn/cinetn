// ============================================
// INDEX.JS - PAGE D'ACCUEIL
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    showSkeletonLoaders();
    await loadContent();
});

function showSkeletonLoaders() {
    const containers = ['nouveautes-grid', 'animes-grid', 'series-grid', 'films-grid'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = Array(12).fill(0).map(() =>
                '<div class="skeleton skeleton-content-card"></div>'
            ).join('');
        }
    });
}

async function loadContent() {
    try {
        // Check cache first
        const cacheKey = 'homepage_content';
        let allContent = cacheManager.get(cacheKey, 'catalogue');

        if (!allContent) {
            // Charger tous les contenus
            allContent = await getAllContent();
            // Cache for 1 minute only (pour voir les nouveautés rapidement)
            cacheManager.set(cacheKey, allContent, 'catalogue', 60000); // 1 minute
        }

        // Nouveautés (les 12 derniers ajouts, triés par date de création)
        const nouveautes = [...allContent]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 12);
        renderContent('nouveautes-grid', nouveautes);

        // Animes populaires
        const animes = allContent.filter(c => c.type === 'anime').slice(0, 12);
        renderContent('animes-grid', animes);

        // Séries populaires
        const series = allContent.filter(c => c.type === 'serie').slice(0, 12);
        renderContent('series-grid', series);

        // Films populaires
        const films = allContent.filter(c => c.type === 'film').slice(0, 12);
        renderContent('films-grid', films);

    } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
    }
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

async function renderContent(containerId, items) {
    const container = document.getElementById(containerId);

    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = `
            <p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">
                Aucun contenu disponible pour le moment
            </p>
        `;
        return;
    }

    // Récupérer les langues pour chaque item
    const itemsWithLanguages = await Promise.all(
        items.map(async (item) => {
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
