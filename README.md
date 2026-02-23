# This Is (Not) Fine

**This Is (Not) Fine** est une plateforme web dédiée à la mise en relation entre les étudiants en recherche d'opportunités (Stage, Alternance) et les entreprises, avec une vérification stricte des profils.

## 🚀 Fonctionnalités

*   **Authentification Sécurisée** : Inscription et connexion avec hachage des mots de passe (Bcrypt) et limitation des tentatives de connexion (Rate Limiting).
*   **Vérification Étudiante** : Restriction stricte des inscriptions aux étudiants en filtrant les adresses email (domaines d'universités et écoles validés) + vérification par code email (SMTP).
*   **Profils Entreprises (Nouveau)** : Les recruteurs peuvent s'inscrire pour rechercher des étudiants. Leur compte est soumis à une validation manuelle par l'administration.
*   **Gestion de Profils** : 
    *   **Étudiants** : Peuvent mettre à jour leur statut (En recherche, Trouvé), renseigner leurs liens (LinkedIn, GitHub, Portfolio), leur bio, domaine d'études, et uploader leur CV (PDF).
    *   **Entreprises** : Peuvent détailler leur activité et renseigner leur site web.
*   **Moteur de Recherche** : 
    *   Recherche avancée d'étudiants (par nom, mots-clés de bio, ou domaine d'étude).
    *   Recherche conditionnée (les utilisateurs non connectés sont redirigés vers la page de login).
*   **Géolocalisation des Écoles** : Carte interactive (Leaflet) listant les établissements et le nombre d'étudiants inscrits. API Nominatim intégrée pour générer les coordonnées GPS lors de la création d'une école.
*   **Administration Complète** : Interface dédiée (protégée par un rôle admin) pour :
    *   Créer des établissements.
    *   Valider ou rejeter les demandes d'inscription d'entreprises.
    *   Gérer les utilisateurs (bannissement temporaire/définitif, suppression de compte).

## 🛠 Stack Technique

*   **Runtime** : [Bun](https://bun.sh/)
*   **Backend** : Express.js (TypeScript)
*   **Frontend** : React 19, TypeScript, Vite
*   **Base de Données** : PostgreSQL
*   **ORM** : Prisma
*   **Map** : Leaflet / React-Leaflet
*   **Mailing** : Nodemailer

## ⚙️ Prérequis

*   [Bun](https://bun.sh/) installé sur votre machine.
*   Une base de données PostgreSQL.
*   Un serveur SMTP pour l'envoi de mails.

## 📦 Installation et Lancement

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/votre-pseudo/ThisIsNotFine.git
    cd ThisIsNotFine
    ```

2.  **Installer les dépendances**
    ```bash
    bun install
    cd frontend && bun install && cd ..
    ```

3.  **Configurer les variables d'environnement**
    Créez un fichier `.env` à la racine :
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    SESSION_SECRET="votre_secret"
    SMTP_HOST="smtp.example.com"
    SMTP_PORT=587
    SMTP_USER="user"
    SMTP_PASSWORD="password"
    ```

4.  **Initialiser la base de données**
    ```bash
    bunx prisma db push
    # Optionnel : Seeder la BDD
    bun run prisma/seed_schools.ts
    ```

5.  **Lancer le projet**

    *   **Mode Développement (Recommandé)** :
        *   Terminal 1 (Backend) : `bun run dev` (Port 3000)
        *   Terminal 2 (Frontend) : `cd frontend && bun dev` (Port 5173 - avec HMR)

    *   **Mode Production (avec PM2)** :
        1.  Construire le frontend : `cd frontend && bun run build`
        2.  Lancer avec PM2 : `pm2 start ecosystem.config.cjs`
        3.  Sauvegarder pour le redémarrage : `pm2 save` && `pm2 startup`

## 📂 Structure du projet

*   `src/` : Backend API (Express, Prisma).
*   `frontend/` : Application React (Pages, Components, Context).
*   `prisma/` : Schéma de base de données.
*   `public/uploads/` : Stockage des CVs uploadés.

## 🛡 Sécurité

*   Mots de passe hachés (Bcrypt).
*   Protection CSRF/XSS via Helmet et ségrégation Frontend/Backend.
*   Validation des emails universitaires.

## 📄 Licence

Ce projet est sous licence MIT.
