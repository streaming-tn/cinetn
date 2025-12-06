# 🎬 CinéTN - Plateforme de Streaming Moderne

CinéTN est une plateforme de streaming moderne pour films, séries et animes, développée avec HTML, CSS, JavaScript et Supabase.

## ✨ Fonctionnalités

- 🎥 **Streaming de contenu** : Films, séries et animes
- 🔍 **Recherche instantanée** : Trouvez rapidement vos contenus préférés
- 📱 **Design responsive** : Fonctionne sur tous les appareils
- 🌙 **Mode sombre** : Interface élégante et moderne
- 👤 **Gestion de profil** : Historique, favoris et liste de lecture
- 🎨 **Interface premium** : Design moderne avec animations fluides
- 🔐 **Panel admin** : Gestion complète du contenu

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Supabase (Base de données PostgreSQL + Auth)
- **Hébergement** : Vercel
- **Fonts** : Google Fonts (Inter)

## 📁 Structure du Projet

```
cinetn/
├── index.html              # Page d'accueil
├── catalogue.html          # Page catalogue
├── details.html            # Page détails du contenu
├── watch.html              # Page de visionnage
├── profile.html            # Page profil utilisateur
├── admin/                  # Panel administrateur
│   ├── index.html
│   ├── manage-content.html
│   ├── manage-comments.html
│   └── edit-seasons.html
├── css/                    # Fichiers CSS
│   ├── style.css
│   ├── modern-design.css
│   ├── slider.css
│   └── theme.css
├── js/                     # Fichiers JavaScript
│   ├── supabase-client.js
│   ├── search.js
│   ├── index.js
│   └── ...
└── assets/                 # Images et ressources

```

## 🚀 Installation Locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/cinetn.git
   cd cinetn
   ```

2. **Ouvrir avec un serveur local**
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js (http-server)
   npx http-server -p 8000
   ```

3. **Accéder au site**
   Ouvrez votre navigateur et allez sur `http://localhost:8000`

## 🌐 Déploiement sur Vercel

Consultez le fichier `GUIDE_HEBERGEMENT.md` pour les instructions détaillées de déploiement.

## 📊 Base de Données Supabase

### Tables Principales

- **series** : Contenu principal (films, séries, animes)
- **seasons** : Saisons des séries
- **episodes** : Épisodes individuels
- **profiles** : Profils utilisateurs
- **viewing_history** : Historique de visionnage
- **favorites** : Contenus favoris
- **watchlist** : Liste de lecture

## 🔐 Sécurité

- Row Level Security (RLS) activé sur Supabase
- Authentification admin sécurisée
- En-têtes de sécurité HTTP configurés
- Validation des entrées côté client et serveur

## 👨‍💻 Développement

### Prérequis
- Navigateur web moderne
- Compte Supabase
- Compte Vercel (pour le déploiement)

### Configuration Supabase
1. Créer un projet sur [Supabase](https://supabase.com)
2. Copier l'URL et la clé API anonyme
3. Mettre à jour `js/supabase-client.js` avec vos identifiants

## 📝 Licence

© 2025 CinéTN - Tous droits réservés

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Contact

Pour toute question, contactez-nous à : contact@cinetn.com

---

Développé avec ❤️ par l'équipe CinéTN
