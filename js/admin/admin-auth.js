// Script de vérification d'authentification pour les pages admin
// Ce script doit être inclus dans toutes les pages admin

(async function () {
    // Vérifier si Supabase est chargé
    if (typeof supabase === 'undefined') {
        console.error('Supabase n\'est pas chargé');
        return;
    }

    // Vérifier la session de l'utilisateur
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        // Pas de session valide, rediriger vers la page de login
        console.log('Aucune session active, redirection vers login...');
        window.location.href = 'login.html';
        return;
    }

    console.log('Session active:', session.user.email);

    // Initialiser le bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // Afficher un message de confirmation
                if (!confirm('Voulez-vous vraiment vous déconnecter ?')) {
                    return;
                }

                // Déconnexion
                const { error } = await supabase.auth.signOut();

                if (error) {
                    console.error('Erreur lors de la déconnexion:', error);
                    alert('Erreur lors de la déconnexion');
                    return;
                }

                // Rediriger vers la page de login
                window.location.href = 'login.html';
            } catch (err) {
                console.error('Erreur:', err);
                alert('Une erreur est survenue');
            }
        });
    }

    // Écouter les changements d'état d'authentification
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'login.html';
        }
    });
})();
