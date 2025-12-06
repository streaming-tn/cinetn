# 🔐 Guide d'Authentification GitHub

## Problème Rencontré
```
Permission to streaming-tn/cinetn.git denied to lachkar814801-rgb.
fatal: unable to access 'https://github.com/streaming-tn/cinetn.git/': The requested URL returned error: 403
```

## 🎯 Solutions

### Solution 1 : Personal Access Token (PAT) - Recommandé

#### Étape 1 : Créer un Personal Access Token

1. Allez sur GitHub : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Configurez le token :
   - **Note** : `CinéTN Deployment`
   - **Expiration** : `90 days` (ou selon votre préférence)
   - **Scopes** : Cochez **`repo`** (accès complet aux dépôts)
4. Cliquez sur **"Generate token"**
5. **⚠️ IMPORTANT** : Copiez le token immédiatement (vous ne pourrez plus le voir après)

#### Étape 2 : Configurer Git avec le Token

```powershell
# Supprimer l'ancien remote
git remote remove origin

# Ajouter le remote avec le token
# Format : https://VOTRE-TOKEN@github.com/streaming-tn/cinetn.git
git remote add origin https://VOTRE-TOKEN-ICI@github.com/streaming-tn/cinetn.git

# Pousser vers GitHub
git push -u origin main
```

**Exemple** (remplacez `ghp_xxxxx` par votre vrai token) :
```powershell
git remote add origin https://ghp_1234567890abcdefghijklmnopqrstuvwxyz@github.com/streaming-tn/cinetn.git
```

---

### Solution 2 : GitHub CLI (Alternative)

#### Installer GitHub CLI

```powershell
winget install --id GitHub.cli
```

#### S'authentifier

```powershell
gh auth login
```

Suivez les instructions :
1. Choisissez **"GitHub.com"**
2. Choisissez **"HTTPS"**
3. Choisissez **"Login with a web browser"**
4. Copiez le code affiché
5. Appuyez sur Entrée pour ouvrir le navigateur
6. Collez le code et autorisez

#### Pousser vers GitHub

```powershell
git push -u origin main
```

---

### Solution 3 : Vérifier les Permissions du Dépôt

Si vous n'êtes pas le propriétaire de `streaming-tn/cinetn` :

1. Vérifiez que vous avez accès au dépôt
2. Le propriétaire doit vous ajouter comme collaborateur :
   - Aller dans le dépôt → **Settings** → **Collaborators**
   - Ajouter votre compte GitHub

---

### Solution 4 : Utiliser Votre Propre Dépôt

Si `streaming-tn` est une organisation et que vous n'y avez pas accès :

```powershell
# Créer un nouveau dépôt sous votre compte
# Allez sur : https://github.com/new
# Nom : cinetn

# Changer le remote
git remote remove origin
git remote add origin https://github.com/lachkar814801-rgb/cinetn.git
git push -u origin main
```

---

## 🔍 Vérifications

### Vérifier le remote actuel
```powershell
git remote -v
```

### Vérifier votre identité Git
```powershell
git config user.name
git config user.email
```

### Configurer votre identité (si nécessaire)
```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

---

## ✅ Après Authentification Réussie

Une fois que vous avez poussé avec succès :

```powershell
git push -u origin main
```

Vous devriez voir :
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/streaming-tn/cinetn.git
 * [new branch]      main -> main
```

---

## 🆘 Toujours des Problèmes ?

### Effacer les identifiants en cache
```powershell
git credential-cache exit
```

### Utiliser SSH au lieu de HTTPS (Avancé)

1. Générer une clé SSH : https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. Ajouter la clé à GitHub
3. Changer le remote :
```powershell
git remote set-url origin git@github.com:streaming-tn/cinetn.git
```

---

**Recommandation** : Utilisez la **Solution 1** (Personal Access Token) pour une configuration rapide et sécurisée.
