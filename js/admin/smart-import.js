// ============================================
// SMART IMPORT - PARSER JAVASCRIPT
// ============================================

/**
 * Parse le code JavaScript pour extraire les liens
 * Supporte les formats:
 * - var eps1 = ['link1', 'link2', ...]
 * - var eps1 = [['Title', 'link'], ...]
 * - Plusieurs variables (eps1, eps2, eps3, epsAS, etc.)
 * 
 * @param {string} code - Code JavaScript à parser
 * @returns {Object} - {episodeCount, players, preview}
 */
function parseJavaScriptCode(code) {
    try {
        // Nettoyer le code
        code = code.trim();

        // Détecter toutes les variables (var epsX = [...])
        const varPattern = /var\s+(\w+)\s*=\s*\[([\s\S]*?)\];/g;
        const matches = [...code.matchAll(varPattern)];

        if (matches.length === 0) {
            throw new Error('Aucune variable détectée. Format attendu: var eps1 = [...]');
        }

        // Extraire les données de chaque variable
        const players = [];

        for (const match of matches) {
            const varName = match[1];
            const content = match[2];

            // Parser le contenu du tableau
            const links = parseArrayContent(content);

            players.push({
                name: varName,
                links: links
            });
        }

        // Déterminer le nombre d'épisodes (le max de tous les tableaux)
        const episodeCount = Math.max(...players.map(p => p.links.length));

        // Créer la prévisualisation
        const preview = [];
        for (let i = 0; i < episodeCount; i++) {
            const availablePlayers = players.filter(p => p.links[i]).length;
            preview.push({
                episodeNumber: i + 1,
                linkCount: availablePlayers
            });
        }

        return {
            episodeCount,
            players,
            preview
        };

    } catch (error) {
        console.error('Erreur de parsing:', error);
        throw error;
    }
}

/**
 * Parse le contenu d'un tableau JavaScript
 * @param {string} content - Contenu entre les crochets
 * @returns {Array<string>} - Liste des liens
 */
function parseArrayContent(content) {
    const links = [];

    // Supprimer les espaces et retours à la ligne inutiles
    content = content.replace(/\s+/g, ' ').trim();

    // Détecter si c'est un tableau de strings simples ou de tableaux
    const isNestedArray = content.includes('[');

    if (isNestedArray) {
        // Format: [['Title', 'link'], ...]
        const nestedPattern = /\[['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\]/g;
        const nestedMatches = [...content.matchAll(nestedPattern)];

        for (const match of nestedMatches) {
            links.push(match[2]); // On prend le lien (2ème élément)
        }
    } else {
        // Format: ['link1', 'link2', ...]
        const simplePattern = /['"]([^'"]+)['"]/g;
        const simpleMatches = [...content.matchAll(simplePattern)];

        for (const match of simpleMatches) {
            links.push(match[1]);
        }
    }

    return links;
}

/**
 * Importe les épisodes dans Supabase
 * @param {string} seasonId - ID de la saison
 * @param {string} language - Langue (VF, VOSTFR, etc.)
 * @param {Object} parsedData - Données parsées
 */
async function importEpisodesToSupabase(seasonId, language, parsedData) {
    try {
        const { episodeCount, players } = parsedData;

        // Pour chaque épisode
        for (let episodeNum = 1; episodeNum <= episodeCount; episodeNum++) {
            // Vérifier si l'épisode existe déjà
            const { data: existingEpisode } = await supabase
                .from('episodes')
                .select('*')
                .eq('season_id', seasonId)
                .eq('episode_number', episodeNum)
                .single();

            // Construire l'objet languages
            const languagesData = existingEpisode?.languages || {};

            // Ajouter/mettre à jour les liens pour cette langue
            const linksForThisEpisode = [];

            let lecteurCounter = 1; // Compteur pour générer "Lecteur 1", "Lecteur 2", etc.

            for (const player of players) {
                if (player.links[episodeNum - 1]) {
                    linksForThisEpisode.push({
                        id: generateUUID(),
                        server: `Lecteur ${lecteurCounter}`, // Génération automatique du nom
                        link: player.links[episodeNum - 1],
                        date: new Date().toISOString().split('T')[0]
                    });
                    lecteurCounter++; // Incrémenter pour le prochain lecteur
                }
            }

            // Fusionner avec les liens existants
            if (languagesData[language]) {
                // Ajouter aux liens existants
                languagesData[language] = [...languagesData[language], ...linksForThisEpisode];
            } else {
                // Créer la nouvelle langue
                languagesData[language] = linksForThisEpisode;
            }

            if (existingEpisode) {
                // Mettre à jour l'épisode existant
                await supabase
                    .from('episodes')
                    .update({ languages: languagesData })
                    .eq('id', existingEpisode.id);
            } else {
                // Créer un nouvel épisode
                await supabase
                    .from('episodes')
                    .insert({
                        season_id: seasonId,
                        episode_number: episodeNum,
                        title: `Episode ${episodeNum}`,
                        languages: languagesData
                    });
            }
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        throw error;
    }
}

/**
 * Génère un UUID simple
 * @returns {string}
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Supprime un lien spécifique d'un épisode
 * @param {string} episodeId - ID de l'épisode
 * @param {string} language - Langue
 * @param {string} linkId - ID du lien à supprimer
 */
async function deleteLink(episodeId, language, linkId) {
    try {
        // Récupérer l'épisode
        const { data: episode } = await supabase
            .from('episodes')
            .select('*')
            .eq('id', episodeId)
            .single();

        if (!episode) throw new Error('Épisode introuvable');

        const languages = episode.languages || {};

        if (!languages[language]) {
            throw new Error('Langue introuvable');
        }

        // Filtrer le lien à supprimer
        languages[language] = languages[language].filter(link => link.id !== linkId);

        // Si plus aucun lien pour cette langue, supprimer la langue
        if (languages[language].length === 0) {
            delete languages[language];
        }

        // Mettre à jour
        await supabase
            .from('episodes')
            .update({ languages })
            .eq('id', episodeId);

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
    }
}

/**
 * Modifie un lien spécifique
 * @param {string} episodeId - ID de l'épisode
 * @param {string} language - Langue
 * @param {string} linkId - ID du lien
 * @param {string} newLink - Nouveau lien
 */
async function updateLink(episodeId, language, linkId, newLink) {
    try {
        const { data: episode } = await supabase
            .from('episodes')
            .select('*')
            .eq('id', episodeId)
            .single();

        if (!episode) throw new Error('Épisode introuvable');

        const languages = episode.languages || {};

        if (!languages[language]) {
            throw new Error('Langue introuvable');
        }

        // Trouver et mettre à jour le lien
        const linkIndex = languages[language].findIndex(link => link.id === linkId);
        if (linkIndex === -1) {
            throw new Error('Lien introuvable');
        }

        languages[language][linkIndex].link = newLink;

        // Mettre à jour
        await supabase
            .from('episodes')
            .update({ languages })
            .eq('id', episodeId);

        return true;
    } catch (error) {
        console.error('Erreur lors de la modification:', error);
        throw error;
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseJavaScriptCode,
        importEpisodesToSupabase,
        deleteLink,
        updateLink
    };
}
