import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma'; // Import depuis notre nouveau fichier lib
import { allowedDomains } from '../utils/domains';

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

router.post('/api/signup', async (req, res) => {
    const { firstname, lastname, schoolId, searchType, searchStatus, password, email } = req.body;
    
    // Validation Domaine
    const emailDomain = email ? email.split('@')[1] : '';
    if (!email || !allowedDomains.includes(emailDomain)) {
        return res.status(400).send(`Domaine @${emailDomain} non autorisé.`);
    }

    if (!password || password.length < 3) return res.status(400).send('Password trop court.');

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).send('User already exists.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await prisma.user.create({
            data: {
                firstName: firstname,
                lastName: lastname,
                schoolId: parseInt(schoolId),
                password: hashedPassword,
                email: email,
                verificationCode: verificationCode,
                // Création du profil en même temps (cleaner)
                profile: {
                    create: {
                        searchType: searchType || "Stage",
                        searchStatus: searchStatus || "En recherche"
                    }
                }
            },
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

        const session = req.session as any;
        session.userId = user.id;
        res.redirect('/verify-email.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur inscription.');
    }
});

router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.redirect('/login.html?error=not_found');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.redirect('/login.html?error=wrong_password');
        }

        if (!user.emailVerified) {
             return res.redirect('/login.html?error=not_verified');
        }

        const session = req.session as any;
        session.userId = user.id;
        res.redirect('/search.html');

    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur login.');
    }
});

router.post('/api/verify-code', async (req, res) => {
    const session = req.session as any;
    const { code } = req.body;
    if (!session.userId) return res.redirect('/login.html');

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user && user.verificationCode === code) {
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, verificationCode: null }
        });
        res.redirect('/search.html');
    } else {
        res.status(400).send('Code incorrect.');
    }
});

router.get('/api/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

export default router;