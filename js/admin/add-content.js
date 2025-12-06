// ============================================
// ADD-CONTENT.JS - AJOUT DE CONTENU (OMDb API)
// ============================================

let selectedGenres = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    setupEventListeners();
});

function setupEventListeners() {
    // Recherche OMDb
    document.getElementById('tmdb-search-btn').addEventListener('click', searchOMDb);
    document.getElementById('tmdb-search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchOMDb();
    });

    // Gestion des genres
    document.getElementById('genre-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addGenre(e.target.value.trim());
            e.target.value = '';
        }
    });

    // Formulaire
    document.getElementById('add-content-form').addEventListener('submit', handleSubmit);
}

async function searchOMDb() {
    const query = document.getElementById('tmdb-search-input').value.trim();
    const resultsContainer = document.getElementById('tmdb-results');

    if (!query) {
        alert('Veuillez entrer un terme de recherche');
        return;
    }

    resultsContainer.innerHTML = '<p style="color: var(--text-secondary);">Recherche en cours...</p>';

    try {
        // Recherche OMDb (séries uniquement pour commencer)
        const response = await fetch(
            `${OMDB_CONFIG.baseUrl}/?apikey=${OMDB_CONFIG.apiKey}&s=${encodeURIComponent(query)}&type=series`
        );

        if (!response.ok) throw new Error('Erreur API OMDb');

        const data = await response.json();

        if (data.Response === 'False') {
            resultsContainer.innerHTML = '<p style="color: var(--text-secondary);">Aucun résultat trouvé. Essayez un autre terme.</p>';
            return;
        }

        displayOMDbResults(data.Search || []);
    } catch (error) {
        console.error('Erreur OMDb:', error);
        resultsContainer.innerHTML = '<p style="color: #ff6b6b;">Erreur lors de la recherche. Vérifiez votre connexion.</p>';
    }
}

function displayOMDbResults(results) {
    const container = document.getElementById('tmdb-results');

    container.innerHTML = results.slice(0, 5).map(item => {
        const title = item.Title;
        const year = item.Year;
        const poster = item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/100x150';
        const type = item.Type === 'movie' ? 'film' : 'anime';
        const imdbID = item.imdbID;

        return `
            <div class="tmdb-result-item" onclick='fillFormFromOMDb("${imdbID}")'>
                <img src="${poster}" alt="${title}" class="tmdb-result-poster">
                <div class="tmdb-result-info">
                    <h3 style="margin-bottom: var(--spacing-xs);">${title}</h3>
                    <p style="color: var(--text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                        ${year} • ${type.toUpperCase()}
                    </p>
                    <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                        IMDb ID: ${imdbID}
                    </p>
                </div>
                <button class="btn btn-primary">Utiliser</button>
            </div>
        `;
    }).join('');
}

async function fillFormFromOMDb(imdbID) {
    try {
        // Récupérer les détails complets via IMDb ID
        const response = await fetch(
            `${OMDB_CONFIG.baseUrl}/?apikey=${OMDB_CONFIG.apiKey}&i=${imdbID}&plot=full`
        );

        const details = await response.json();

        if (details.Response === 'False') {
            throw new Error(details.Error);
        }

        // Remplir le formulaire
        document.getElementById('title').value = details.Title;
        document.getElementById('type').value = details.Type === 'movie' ? 'film' : 'anime';
        document.getElementById('poster_url').value = details.Poster !== 'N/A' ? details.Poster : '';
        document.getElementById('backdrop_url').value = ''; // OMDb n'a pas de backdrop
        document.getElementById('description').value = details.Plot !== 'N/A' ? details.Plot : '';
        document.getElementById('year').value = details.Year.split('–')[0]; // Prendre la première année
        document.getElementById('rating').value = details.imdbRating !== 'N/A' ? details.imdbRating : '';

        // Genres
        selectedGenres = [];
        if (details.Genre && details.Genre !== 'N/A') {
            selectedGenres = details.Genre.split(', ');
            renderGenreTags();
        }

        // Scroll vers le formulaire
        document.getElementById('add-content-form').scrollIntoView({ behavior: 'smooth' });

        // Cacher les résultats
        document.getElementById('tmdb-results').innerHTML = '';

    } catch (error) {
        console.error('Erreur lors du remplissage:', error);
        alert('Erreur lors du remplissage automatique: ' + error.message);
    }
}

function addGenre(genre) {
    if (!genre || selectedGenres.includes(genre)) return;

    selectedGenres.push(genre);
    renderGenreTags();
}

function removeGenre(genre) {
    selectedGenres = selectedGenres.filter(g => g !== genre);
    renderGenreTags();
}

function renderGenreTags() {
    const container = document.getElementById('genre-tags');

    container.innerHTML = selectedGenres.map(genre => `
        <div class="genre-tag">
            <span>${genre}</span>
            <button type="button" onclick="removeGenre('${genre}')">×</button>
        </div>
    `).join('');
}

async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        poster_url: document.getElementById('poster_url').value || null,
        backdrop_url: document.getElementById('backdrop_url').value || null,
        description: document.getElementById('description').value || null,
        year: parseInt(document.getElementById('year').value) || null,
        rating: parseFloat(document.getElementById('rating').value) || null,
        genres: selectedGenres
    };

    try {
        const { data, error } = await supabase
            .from('series')
            .insert([formData])
            .select();

        if (error) throw error;

        alert('✅ Contenu ajouté avec succès !');

        // Demander si l'utilisateur veut ajouter des saisons
        const addSeasons = confirm('Voulez-vous ajouter des saisons maintenant ?');
        if (addSeasons) {
            window.location.href = `manage-content.html?id=${data[0].id}`;
        } else {
            // Réinitialiser le formulaire
            document.getElementById('add-content-form').reset();
            selectedGenres = [];
            renderGenreTags();
        }

    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('❌ Erreur lors de l\'ajout du contenu');
    }
}
