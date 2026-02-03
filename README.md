# This Is (Not) Fine

**This Is (Not) Fine** est une plateforme web dédiée à la mise en relation et à la gestion des profils étudiants, spécifiquement conçue pour les étudiants de l'Université de Strasbourg (Unistra). Elle permet aux étudiants de signaler leur statut de recherche (Stage, Alternance) et aux administrateurs de gérer les établissements.

## 🚀 Fonctionnalités

* **Authentification Sécurisée** : Inscription et connexion avec hachage des mots de passe (Bcrypt).
* **Vérification Étudiante** : Restriction stricte des inscriptions aux adresses email `@etu.unistra.fr` avec vérification par code email (SMTP).
* **Gestion de Profils** : Les étudiants peuvent mettre à jour leur statut (En recherche, Trouvé), leurs liens (LinkedIn, GitHub, Portfolio) et leur domaine d'études.
* **Géolocalisation des Écoles** : Création d'établissements avec autocomplétion et récupération automatique des coordonnées GPS via l'API Adresse du gouvernement français (`api-adresse.data.gouv.fr`).
* **Recherche** : Annuaire des étudiants par établissement.
* **Administration** : Interface dédiée pour créer des établissements (protégée par un rôle admin).

## 🛠 Stack Technique

* **Runtime** : [Bun](https://bun.sh/) (Rapide et compatible Node.js)
* **Backend** : Express.js (TypeScript)
* **Base de Données** : PostgreSQL
* **ORM** : Prisma
* **Frontend** : HTML5, CSS3 (Vanilla), JavaScript
* **Mailing** : Nodemailer
* **Déploiement** : Compatible Vercel (Serverless)

## ⚙️ Prérequis

* [Bun](https://bun.sh/) installé sur votre machine.
* Une base de données PostgreSQL (ou un service comme Vercel Postgres / Supabase).
* Un serveur SMTP pour l'envoi de mails (Gmail, Brevo, etc.).

## 📦 Installation en local

1.  **Cloner le dépôt**
    ```bash
    git clone [https://github.com/votre-pseudo/ThisIsNotFine.git](https://github.com/votre-pseudo/ThisIsNotFine.git)
    cd ThisIsNotFine
    ```

2.  **Installer les dépendances**
    ```bash
    bun install
    ```

3.  **Configurer les variables d'environnement**
    Créez un fichier `.env` à la racine du projet et remplissez-le avec vos informations :

    ```env
    # Base de données (PostgreSQL)
    POSTGRES_PRISMA_URL="postgresql://user:password@host:port/database?pgbouncer=true"
    POSTGRES_URL_NON_POOLING="postgresql://user:password@host:port/database"

    # Configuration SMTP (Emails)
    SMTP_HOST="smtp.example.com"
    SMTP_PORT=587
    SMTP_SECURE=false
    SMTP_USER="votre_email@example.com"
    SMTP_PASSWORD="votre_mot_de_passe_smtp"
    ```

4.  **Initialiser la base de données**
    Poussez le schéma Prisma vers votre base de données :
    ```bash
    bunx prisma db push
    ```

5.  **Lancer le serveur**
    ```bash
    bun run src/index.ts
    ```
    Le serveur sera accessible sur `http://localhost:45645`.

## 🚀 Déploiement sur Vercel

Ce projet est configuré pour être déployé facilement sur [Vercel](https://vercel.com).

1.  Importez votre dépôt GitHub sur Vercel.
2.  Dans les paramètres du projet Vercel ("Build & Development Settings") :
    * **Build Command** : `bunx prisma generate`
    * **Install Command** : `bun install`
3.  Ajoutez une base de données **Vercel Postgres** dans l'onglet "Storage".
4.  Configurez les variables d'environnement SMTP (`SMTP_HOST`, `SMTP_USER`, etc.) dans l'onglet "Settings" > "Environment Variables".
5.  Déployez !

*Note : Le fichier `vercel.json` inclus configure automatiquement les routes pour rediriger le trafic vers l'application Express.*

## 📂 Structure du projet

* `src/index.ts` : Point d'entrée du serveur, gestion des routes API et authentification.
* `prisma/schema.prisma` : Définition des modèles de base de données (User, School, Profile).
* `public/` : Fichiers statiques (HTML, CSS, JS client-side).
    * `create-school.html` : Formulaire de création avec API Adresse.
    * `signup.html` / `verify-email.html` : Flux d'inscription.

## 🛡 Sécurité

* Les mots de passe sont hachés via `bcryptjs`.
* Les routes sensibles sont protégées par des middlewares (`requireAuth`, `requireAdmin`).
* Les sessions sont gérées via `express-session`.

## 📄 Licence

Ce projet est sous licence MIT.
