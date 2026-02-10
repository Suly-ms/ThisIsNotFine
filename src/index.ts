import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

// Import des routes
import authRouter, { requireAuth } from './routes/auth';
import profileRouter from './routes/profile';
import schoolRouter from './routes/school';

const app = express();
const port = 3000;

app.use(helmet({
    // On autorise Leaflet et les tuiles de carte
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "https://*.openstreetmap.org", "https://unpkg.com"],
            connectSrc: ["'self'", "https://raw.githubusercontent.com"], // Pour le GeoJSON
        },
    },
    // On désactive COEP car les serveurs de tuiles (OSM) ne sont pas compatibles
    crossOriginEmbedderPolicy: false, 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Setup Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Middleware Global de protection (Liste Blanche)
app.use((req, res, next) => {
    const publicRoutes = [
        '/',
        '/signup.html',
        '/login.html',
        '/api/login',
        '/api/signup',
        '/api/schools', // Souvent public pour la liste déroulante
        '/style.css',
        '/about.html',
        '/search.html',
        '/school.html',
        '/email-correct.html'
    ];

    // On laisse passer si c'est public OU si c'est une route d'API student publique
    if (publicRoutes.includes(req.path) || req.path.startsWith('/api/schools/')) {
        return next();
    }

    // Sinon, on applique le middleware d'auth importé
    requireAuth(req, res, next);
});

// Servir les fichiers statiques
app.use(express.static(path.join(projectRoot, 'public')));

// Utilisation des Routers
app.use(authRouter);
app.use(profileRouter);
app.use(schoolRouter);

// Démarrage serveur
// Démarrage serveur
if (import.meta.main || process.env.pm_id) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;
