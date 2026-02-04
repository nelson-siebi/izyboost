---
description: Comment déployer les mises à jour sur le serveur (VPS/SSH)
---

Ce guide explique comment mettre à jour votre serveur de production via SSH après avoir pushé vos modifications sur GitHub.

### 1. Connexion au serveur
Connectez-vous à votre serveur via SSH (Terminal, PuTTY, Laragon Terminal, etc.).
```bash
ssh user@votre-ip-serveur
```

### 2. Accéder au dossier du projet
Naviguez vers le dossier racine de votre application (le chemin peut varier selon votre configuration, ex: `/var/www/izyboost`).
```bash
cd /chemin/vers/votre/projet
# Exemple : cd /var/www/izyboost
```

### 3. Récupérer les modifications (Git Pull)
Récupérez les derniers changements depuis la branche `main`.
```bash
git pull origin main
```
*Note : Si vous avez des fichiers modifiés localement sur le serveur qui bloquent le pull, vous devrez peut-être les stasher (`git stash`) ou les annuler.*

### 4. Mises à jour Backend (Laravel)
Si vous avez modifié des fichiers PHP, des configurations ou des migrations, lancez ces commandes :

```bash
# Installer les nouvelles dépendances PHP (si composer.json a changé)
composer install --no-dev --optimize-autoloader

# Appliquer les migrations de base de données (si nécessaire)
php artisan migrate --force

# Mettre à jour les caches de configuration et de routage
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Redémarrer les workers (pour que les modifications de Job/Mail soient prises en compte)
php artisan queue:restart
```

### 5. Configurer le Webhook (Une seule fois)
Assurez-vous que l'URL du webhook est bien configurée dans votre panneau Nelsius Pay :
`https://votre-domaine.com/api/webhooks/nelsius`

### 6. Mises à jour Frontend (React/Vite)
Si vous hébergez le frontend sur le même serveur et que vous le buildez sur place :

```bash
# Aller dans le dossier frontend
cd izyboost_web

# Installer les dépendances JS (si package.json a changé)
npm install

# Lancer la compilation de production
npm run build
```

*Si vous compilez en local et envoyez les fichiers :*
1. Lancez `npm run build` sur votre machine locale.
2. Copiez le contenu du dossier `dist` vers le dossier public de votre serveur (souvent via SFTP/FileZilla vers `/var/www/izyboost/public` ou un dossier séparé pour le frontend).
