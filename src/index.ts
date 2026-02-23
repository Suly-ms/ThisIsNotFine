import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

import authRouter, { requireAuth } from './routes/auth';
import profileRouter from './routes/profile';
import schoolRouter from './routes/school';
import searchRouter from './routes/search';
import adminRouter from './routes/admin';

const app = express();
const port = 3000; 

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            
            scriptSrc: ["'self'", "https://unpkg.com"],
            
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            
            imgSrc: ["'self'", "data:", "https://*.openstreetmap.org", "https://unpkg.com"],
            connectSrc: ["'self'", "https://raw.githubusercontent.com", "https://nominatim.openstreetmap.org"],
        },
    },
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

// Middleware d'authentification pour l'API uniquement
app.use('/api', (req, res, next) => {
    const publicApiRoutes = [
        '/api/login',
        '/api/signup',
        '/api/schools', // Public list
        '/api/domains', // Public domains list
        '/api/students', // Public student search
    ];

    // Si la route est publique ou commence par /api/schools/ (détail public), on laisse passer
    // Attention: mounted on /api, req.path is relative (e.g. /schools)
    // We should better use req.originalUrl or adjust the list.
    // Let's use req.originalUrl which includes the full path including /api
    // But req.originalUrl might include query params.
    // Simpler: use path.join or just expect the relative path if we wanted.
    // BUT EASIEST: Match the full path using req.baseUrl + req.path ~ but redundant.

    // Fix: We'll just checks against req.originalUrl (ignoring query params)
    const currentPath = req.originalUrl.split('?')[0];

    if (publicApiRoutes.includes(currentPath) || currentPath.startsWith('/api/schools/')) {
        return next();
    }

    // Sinon on vérifie la session via requireAuth
    requireAuth(req, res, next);
});

// Servir le frontend React buildé
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Servir les uploads (CVs, etc.)
app.use('/uploads', express.static(path.join(projectRoot, 'public/uploads')));

// Utilisation des Routers pour l'API
app.use(authRouter);
app.use(profileRouter);
app.use(schoolRouter);
app.use(searchRouter);
app.use(adminRouter);

// Pour toutes les autres routes (SPA), renvoyer index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Démarrage serveur
// Démarrage serveur
if (import.meta.main || process.env.pm_id) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;
