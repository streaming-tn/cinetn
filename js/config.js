// ============================================
// CONFIGURATION CINÉ TN
// ============================================

// Configuration API OMDb (Open Movie Database)
const OMDB_CONFIG = {
    apiKey: '41c57d35',
    baseUrl: 'https://www.omdbapi.com'
};

// Mapping des langues vers les drapeaux
const LANGUAGES = {
    'VF': {
        name: 'Version Française',
        flag: 'assets/flags/vf.svg',
        code: 'fr'
    },
    'VOSTFR': {
        name: 'Version Originale Sous-titrée Français',
        flag: 'assets/flags/vo.svg',
        code: 'jp'
    },
    'VO': {
        name: 'Version Originale Japonaise',
        flag: 'assets/flags/vo.svg',
        code: 'jp'
    },
    'VA': {
        name: 'Version Anglaise',
        flag: 'assets/flags/va.svg',
        code: 'en'
    },
    'VTN': {
        name: 'Version Tunisienne',
        flag: 'assets/flags/vtn.svg',
        code: 'tn'
    },
    'VAR': {
        name: 'Version Arabe',
        flag: 'assets/flags/var.svg',
        code: 'ar'
    }
};

// Constantes de l'application
const APP_CONFIG = {
    name: 'CinéTN',
    version: '1.0.0',
    maxHistoryItems: 100,
    searchDebounceMs: 300,
    lazyLoadOffset: 200
};

// Types de contenu
const CONTENT_TYPES = {
    ANIME: 'anime',
    SERIE: 'serie',
    FILM: 'film'
};
