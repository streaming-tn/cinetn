# 🚀 Guide Rapide - Commandes Essentielles

## 📋 Commandes à Exécuter dans l'Ordre

### 1️⃣ Initialiser Git
```powershell
cd "d:\website\word press"
git init
git add .
git commit -m "Initial commit - CinéTN project"
```

### 2️⃣ Créer le dépôt GitHub
1. Allez sur https://github.com/new
2. Nom du dépôt : `cinetn`
3. Visibilité : **Public**
4. Cliquez sur **"Create repository"**

### 3️⃣ Pousser vers GitHub
```powershell
# Remplacez 'VOTRE-USERNAME' par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/cinetn.git
git branch -M main
git push -u origin main
```

### 4️⃣ Déployer sur Vercel
1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur **"Add New Project"**
4. Sélectionnez votre dépôt `cinetn`
5. Cliquez sur **"Deploy"**

### 5️⃣ Mises à jour futures
```powershell
cd "d:\website\word press"
git add .
git commit -m "Description de vos modifications"
git push
```

---

## ✅ Checklist de Vérification

- [ ] Git est installé (`git --version`)
- [ ] Compte GitHub créé
- [ ] Compte Vercel créé
- [ ] Dépôt GitHub créé
- [ ] Code poussé sur GitHub
- [ ] Projet déployé sur Vercel
- [ ] Site accessible en ligne
- [ ] Supabase fonctionne
- [ ] Toutes les pages fonctionnent

---

## 🆘 Problèmes Courants

### Git n'est pas reconnu
```powershell
# Installez Git depuis : https://git-scm.com/download/win
```

### Permission denied (GitHub)
```powershell
git config --global user.email "votre-email@example.com"
git config --global user.name "Votre Nom"
```

### Le site ne charge pas
1. Vérifiez les logs sur Vercel
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que Supabase est accessible

---

## 📞 Liens Utiles

- 🌐 **Vercel** : https://vercel.com
- 🗄️ **Supabase** : https://supabase.com
- 📦 **GitHub** : https://github.com
- 📖 **Guide complet** : Voir `GUIDE_HEBERGEMENT.md`

---

**Temps estimé : 15-30 minutes** ⏱️
