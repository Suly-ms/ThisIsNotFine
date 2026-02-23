import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma'; // Import depuis notre nouveau fichier lib
import { allowedDomains } from '../utils/domains';
import rateLimit from 'express-rate-limit';

const router = Router();

// --- Middlewares ---

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as { userId?: number };
    if (session.userId) {
        next();
    } else {
        if (req.path.startsWith('/api/')) {
            res.status(401).json({ error: "Non connecté" });
        } else {
            res.redirect('/login.html');
        }
    }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as { userId?: number };
    if (session.userId) {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (user && user.admin) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Configuration du limiteur : 5 tentatives max toutes les 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite chaque IP à 5 requêtes par fenêtre
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

// --- Config Email ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// --- Routes ---
router.get('/api/domains', (req, res) => {
    res.json(allowedDomains);
});

router.post('/api/signup', async (req, res) => {
    const { firstName, firstname, lastName, lastname, schoolId, searchType, searchStatus, password, email, userType, companyName, companyWebsite, companyDescription } = req.body;

    // Validation Domaine (seulement pour les étudiants)
    if (userType !== 'COMPANY') {
        const emailDomain = email ? email.split('@')[1] : '';
        if (!email || !allowedDomains.includes(emailDomain)) {
            return res.status(400).send(`Domaine @${emailDomain} non autorisé pour les étudiants.`);
        }
    }

    if (!password || password.length < 3) return res.status(400).send('Password trop court.');

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).send('User already exists.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        let userData: any = {
            firstName: firstName || firstname,
            lastName: lastName || lastname,
            password: hashedPassword,
            email: email,
            verificationCode: verificationCode,
            userType: userType || 'STUDENT',
            adminVerified: userType !== 'COMPANY', // Companies need manual verification
        };

        if (userType === 'COMPANY') {
            userData.companyProfile = {
                create: {
                    name: companyName,
                    website: companyWebsite,
                    description: companyDescription
                }
            };
        } else {
            userData.schoolId = parseInt(schoolId);
            userData.profile = {
                create: {
                    searchType: searchType || "Stage",
                    searchStatus: searchStatus || "En recherche"
                }
            };
        }

        const user = await prisma.user.create({
            data: userData,
        });

        // Envoi email (simplifié)
        if (transporter) {
            transporter.sendMail({
                from: '"This Is (Not) Fine" <noreply@thisisnotfine.fr>',
                to: email,
                subject: 'Code de vérification',
                text: `Code: ${verificationCode}`,
                html: `<p>Code: <strong>${verificationCode}</strong></p>`
            }).catch(console.error);
        }

        if (userType === 'COMPANY') {
            res.json({ success: true, message: "Inscription réussie. Votre compte entreprise est en attente de validation par un administrateur." });
        } else {
            // For students, we might want to log them in directly or ask for email verify
            // Current flow: ask for email verify (but we return success json)
            res.json({ success: true, message: "Inscription réussie. Veuillez vérifier vos emails." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur inscription.');
    }
});

router.post('/api/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).send('Utilisateur non trouvé');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Mot de passe incorrect');
        }

        if (!user.adminVerified) {
            return res.status(403).send('Compte en attente de validation par un administrateur.');
        }

        if (!user.emailVerified) {
            return res.status(403).send('Email non vérifié');
        }

        if (user.banExpiresAt && user.banExpiresAt > new Date()) {
            return res.status(403).send(`Compte suspendu jusqu'au ${user.banExpiresAt.toLocaleString()}.`);
        }

        const session = req.session as any;
        session.userId = user.id;
        res.json({ success: true, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, admin: user.admin, email: user.email, userType: user.userType } });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur login.');
    }
});

router.post('/api/verify-code', async (req, res) => {
    const { code, email } = req.body;
    console.log("[VERIFY-CODE] Payload reçu :", { code, email });
    const session = req.session as any;

    // Si l'email est fourni depuis le formulaire (par défaut maintenant)
    if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && user.verificationCode === code) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true, verificationCode: null }
            });

            // On connecte l'utilisateur automatiquement après la vérification
            session.userId = user.id;
            return res.json({ success: true, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, admin: user.admin, email: user.email, userType: user.userType } });
        }
        return res.status(400).send('Code ou email incorrect.');
    }

    // Fallback original si session.userId est présent
    if (!session.userId) return res.status(401).send('Email manquant ou non connecté');

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user && user.verificationCode === code) {
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, verificationCode: null }
        });
        res.json({ success: true });
    } else {
        res.status(400).send('Code incorrect.');
    }
});

router.get('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

export default router;
