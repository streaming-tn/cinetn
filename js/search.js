// ============================================
// RECHERCHE TEMPS RÉEL - CINÉ TN
// ============================================

class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.debounceTimer = null;
        this.init();
    }

    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.searchInput = document.querySelector('.search-input');
        this.searchResults = document.querySelector('.search-results');

        if (!this.searchInput || !this.searchResults) {
            console.warn('Éléments de recherche non trouvés');
            return;
        }

        // Écouter la frappe
        this.searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        // Fermer les résultats au clic extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });
    }

    handleInput(query) {
        // Annuler le timer précédent
        clearTimeout(this.debounceTimer);

        // Si moins de 2 caractères, cacher les résultats
        if (query.trim().length < 2) {
            this.hideResults();
            return;
        }

        // Debounce de 200ms pour une recherche plus rapide
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 200);
    }

    async performSearch(query) {
        try {
            // Afficher un loader
            this.showLoading();

            // Recherche dans Supabase
            const results = await searchContent(query);

            // Afficher les résultats
            this.displayResults(results);
        } catch (error) {
            console.error('Erreur de recherche:', error);
            this.showError();
        }
    }

    showLoading() {
        this.searchResults.innerHTML = `
            <div class="search-loading" style="padding: var(--spacing-md); text-align: center;">
                <p style="color: var(--text-secondary);">Recherche en cours...</p>
            </div>
        `;
        this.searchResults.classList.add('active');
    }

    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results" style="padding: var(--spacing-md); text-align: center;">
                    <p style="color: var(--text-secondary);">Aucun résultat trouvé</p>
                </div>
            `;
            this.searchResults.classList.add('active');
            return;
        }

        const html = results.map(item => `
            <div class="search-result-item" onclick="window.location.href='details.html?id=${item.id}'">
                <img 
                    src="${item.poster_url || 'assets/placeholder.jpg'}" 
                    alt="${item.title}"
                    class="search-result-poster"
                    loading="lazy"
                >
                <div class="search-result-info">
                    <h4>${item.title}</h4>
                    <p>${item.year || ''} • ${item.type.toUpperCase()}</p>
                </div>
            </div>
        `).join('');

        this.searchResults.innerHTML = html;
        this.searchResults.classList.add('active');
    }

    showError() {
        this.searchResults.innerHTML = `
            <div class="search-error" style="padding: var(--spacing-md); text-align: center;">
                <p style="color: var(--accent-secondary);">Une erreur est survenue</p>
            </div>
        `;
        this.searchResults.classList.add('active');
    }

    hideResults() {
        this.searchResults.classList.remove('active');
    }
}

// Initialiser la recherche
const searchManager = new SearchManager();
