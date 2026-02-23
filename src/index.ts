/**
 * Point d'entrée principal du serveur backend.
 * Initialise l'application Express, configure les middlewares (sécurité, sessions, parsers),
 * monte les routeurs de l'API et sert les fichiers statiques du frontend.
 */
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

            scriptSrc: ["'self'", "https://unpkg.com", "'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM='"],

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

app.use('/api', (req, res, next) => {
    const publicApiRoutes = [
        '/api/login',
        '/api/signup',
        '/api/verify-code',
        '/api/schools',
        '/api/domains',
    ];

    const currentPath = req.originalUrl.split('?')[0];

    if (publicApiRoutes.includes(currentPath) || currentPath.startsWith('/api/schools/')) {
        return next();
    }

    requireAuth(req, res, next);
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/uploads', express.static(path.join(projectRoot, 'public/uploads')));

app.use(authRouter);
app.use(profileRouter);
app.use(schoolRouter);
app.use(searchRouter);
app.use(adminRouter);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

if (import.meta.main || process.env.pm_id) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;
