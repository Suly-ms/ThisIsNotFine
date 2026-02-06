import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'mon_super_secret_indevinable',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 3600000 // 1 heure
    }
}));

import { fileURLToPath } from 'url'; // <--- NOUVEL IMPORT

// On recrée __dirname manuellement pour être compatible ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');



const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as { userId?: number };
    if (session.userId) {
        next();
    } else {
        // Si c'est une requête API (AJAX), on renvoie 401 au lieu de rediriger
        if (req.path.startsWith('/api/')) {
            res.status(401).json({ error: "Non connecté" });
        } else {
            res.redirect('/login.html');
        }
    }
};

// Liste des routes publiques (ajout des routes auth)
app.use((req, res, next) => {
    const publicRoutes = [
        '/',
        '/signup.html',
        '/api/login',
        '/api/signup',
        '/style.css',
        '/api/schools',
        '/about.html',
        '/search.html',
        '/login.html',
        '/school.html',
        '/email-correct.html'  
    ];

    if (publicRoutes.includes(req.path) || req.path.startsWith('/api/schools/')) {
        return next();
    }
    requireAuth(req, res, next);
});

app.get('/api/schools', async (req, res) => {
    try {
        const schools = await prisma.school.findMany();
        res.json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching schools.');
    }
});

app.use(express.static(path.join(projectRoot, 'public')));

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
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

app.get('/api/me', async (req, res) => {
    const session = req.session as { userId?: number };
    if (session.userId) {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { profile: true }
        });
        if (user) {
            res.json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                admin: user.admin,
                profile: user.profile
            });
        } else {
            res.status(404).send('User not found');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.put('/api/me/profile', async (req, res) => {
    const session = req.session as { userId?: number };
    if (!session.userId) {
        return res.status(401).send('Unauthorized');
    }

    const { searchType, searchStatus, linkedin, github, portfolio, studyDomain } = req.body;

    try {
        const updateData: any = {};
        if (searchType) updateData.searchType = searchType;
        if (searchStatus) updateData.searchStatus = searchStatus;

        updateData.linkedin = linkedin || null;
        updateData.github = github || null;
        updateData.portfolio = portfolio || null;
        updateData.studyDomain = studyDomain || null;

        // On utilise upsert au cas où le profil n'existerait pas (migration, ancien compte...)
        const profile = await prisma.studentProfile.upsert({
            where: { userId: session.userId },
            update: updateData,
            create: {
                userId: session.userId,
                searchType: searchType || "Stage",
                searchStatus: searchStatus || "En recherche",
                linkedin: linkedin || null,
                github: github || null,
                portfolio: portfolio || null,
                studyDomain: studyDomain || null
            }
        });
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating profile');
    }
});

// Config Nodemailer (Ethereal pour dev)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true pour le port 465, false pour les autres
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Erreur de connexion SMTP :", error);
    } else {
        console.log("Prêt à envoyer des emails !");
    }
});

app.post('/api/signup', async (req, res) => {
    const { firstname, lastname, schoolId, searchType, searchStatus, password, email } = req.body;

    // Liste des principaux domaines académiques français
    // À mettre à jour si des étudiants vous signalent un manquant.
    const allowedDomains = [
        // --- Universités & Académies ---
        'etu.unistra.fr',        // Strasbourg
        'unistra.fr',
        'etu.sorbonne-universite.fr', // Sorbonne
        'sorbonne-universite.fr',
        'etu.u-paris.fr',        // Université de Paris
        'u-paris.fr',
        'etu.univ-lyon1.fr',     // Lyon 1
        'univ-lyon1.fr',
        'etu.univ-lyon2.fr',     // Lyon 2
        'univ-lyon2.fr',
        'etu.univ-lyon3.fr',     // Lyon 3
        'univ-lyon3.fr',
        'etu.univ-amu.fr',       // Aix-Marseille
        'univ-amu.fr',
        'etu.u-bordeaux.fr',     // Bordeaux
        'u-bordeaux.fr',
        'etu.univ-lille.fr',     // Lille
        'univ-lille.fr',
        'etu.univ-nantes.fr',    // Nantes
        'univ-nantes.fr',
        'etu.univ-rennes1.fr',   // Rennes 1
        'univ-rennes1.fr',
        'etu.univ-rennes2.fr',   // Rennes 2
        'univ-rennes2.fr',
        'etu.univ-toulouse.fr',  // Toulouse
        'univ-toulouse.fr',
        'etu.univ-grenoble-alpes.fr', // Grenoble
        'univ-grenoble-alpes.fr',
        'etu.univ-cotedazur.fr', // Nice / Côte d'Azur
        'univ-cotedazur.fr',
        'etu.univ-lorraine.fr',  // Lorraine (Nancy/Metz)
        'univ-lorraine.fr',
        'etu.univ-montpellier.fr', // Montpellier
        'univ-montpellier.fr',
        'etu.unicaen.fr',        // Caen
        'unicaen.fr',
        'etu.u-picardie.fr',     // Amiens (Picardie)
        'u-picardie.fr',
        'etu.univ-poitiers.fr',  // Poitiers
        'univ-poitiers.fr',
        'etu.univ-tours.fr',     // Tours
        'univ-tours.fr',
        'etu.univ-orleans.fr',   // Orléans
        'univ-orleans.fr',

        // --- Écoles Tech / Informatique ---
        'epitech.eu',            // Epitech (National)
        'student.42.fr',         // École 42 (Paris)
        '42.fr',
        'student.42lyon.fr',     // 42 Lyon
        'student.42nice.fr',     // 42 Nice
        'supinfo.com',           // Supinfo
        'epita.fr',              // EPITA
        'esiea.fr',              // ESIEA
        'efrei.fr',              // EFREI
        'ece.fr',                // ECE
        'etna.io',               // ETNA

        // --- Grandes Écoles d'Ingénieurs ---
        'polytechnique.edu',     // Polytechnique (X)
        'centralesupelec.fr',    // CentraleSupélec
        'mines-paristech.fr',    // Mines Paris
        'telecom-paris.fr',      // Télécom Paris
        'enpc.fr',               // Ponts ParisTech
        'insa-lyon.fr',          // INSA Lyon
        'insa-toulouse.fr',      // INSA Toulouse
        'insa-rennes.fr',        // INSA Rennes
        'insa-rouen.fr',         // INSA Rouen
        'insa-strasbourg.fr',    // INSA Strasbourg
        'utbm.fr',               // UTBM
        'utc.fr',                // UTC
        'utt.fr',                // UTT
        'ens.fr',                // ENS Ulm
        'ens-lyon.fr',           // ENS Lyon
        'ens-paris-saclay.fr',   // ENS Paris-Saclay
        'arts-et-metiers.fr',    // Arts et Métiers (ENSAM)

        // --- Grandes Écoles de Commerce ---
        'hec.edu',               // HEC Paris
        'essec.edu',             // ESSEC
        'edhec.com',             // EDHEC
        'em-lyon.com',           // EM Lyon
        'escpeurope.eu',         // ESCP
        'audencia.com',          // Audencia
        'grenoble-em.com',       // GEM
        'neoma-bs.fr',           // NEOMA
        'kedgebs.com',           // KEDGE
        'skema.edu',             // SKEMA
        'tbs-education.fr',      // Toulouse BS
        
        // --- Sciences Po ---
        'sciencespo.fr',         // Sciences Po Paris (+ campus régionaux)
        'sciencespo-lille.eu',   // Sciences Po Lille
        'sciencespo-lyon.fr',    // Sciences Po Lyon
        'sciencespo-bordeaux.fr' // Sciences Po Bordeaux
    ];

    // 1. Récupérer le domaine de l'email
    const emailDomain = email.split('@')[1];

    // 2. Vérifier si le domaine est dans notre liste
    if (!email || !allowedDomains.includes(emailDomain)) {
        console.log(`Inscription refusée pour le domaine : ${emailDomain}`);
        
        return res.status(400).send(
            `Désolé, l'école liée à "@${emailDomain}" n'est pas encore reconnue.\n` +
            `Envoyez un mail à thisisnotfine.noreply@gmail.com pour l'ajouter !`
        );
    }

    if (!password || password.length < 3) {
        return res.status(400).send('Password must be at least 3 characters.');
    }

    try {
        const school = await prisma.school.findUnique({
            where: { id: parseInt(schoolId, 10) },
        });

        if (!school) {
            return res.status(400).send('Invalid school ID.');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(409).send('User already exists. Please login.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await prisma.user.create({
            data: {
                firstName: firstname,
                lastName: lastname,
                schoolId: school.id,
                admin: false,
                password: hashedPassword,
                email: email,
                emailVerified: false,
                verificationCode: verificationCode
            },
        });

        await prisma.studentProfile.create({
            data: {
                userId: user.id,
                searchType: searchType,
                searchStatus: searchStatus,
            },
        });

        // Send email
        if (transporter) {
            const message = {
                from: '"This Is (Not) Fine" <thisisnotfine.noreply@gmail.com>', // Mets ton email ici
                to: email,
                subject: 'Code de vérification',
                text: `Votre code de vérification est : ${verificationCode}`,
                html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>`
            };

            // On envoie le mail sans attendre (ou avec await si tu préfères)
            transporter.sendMail(message, (err, info) => {
                if (err) {
                    console.error('Erreur lors de l\'envoi du mail :', err);
                    // On ne quitte plus le processus avec process.exit(1), on log juste l'erreur
                } else {
                    console.log('Email envoyé : %s', info.messageId);
                }
            });
        } else {
            console.log(`[DEV MODE] Verification Code for ${email}: ${verificationCode}`);
        }

        const session = req.session as unknown as { userId: number };
        session.userId = user.id;

        res.redirect('/verify-email.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during signup.');
    }
});

app.post('/api/verify-code', async (req, res) => {
    const session = req.session as unknown as { userId: number };
    const { code } = req.body;

    if (!session.userId) {
        return res.redirect('/login.html');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });

        if (!user) {
            return res.redirect('/login.html');
        }

        if (user.verificationCode === code) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    verificationCode: null
                }
            });
            res.redirect('/search.html');
        } else {
            res.status(400).send('Code incorrect.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying code.');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.redirect('/login.html');
        }

        // Vérification mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.redirect('/login.html');
        }

        const session = req.session as unknown as { userId: number };
        session.userId = user.id;

        res.redirect('/search.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login.');
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/create-school.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(projectRoot, 'public', 'create-school.html'));
});

app.post('/api/schools', requireAdmin, async (req, res) => {
    const { name, latitude, longitude } = req.body;
    try {
        const school = await prisma.school.create({
            data: {
                name,
                latitude: latitude ? parseFloat(latitude) : 0.0,
                longitude: longitude ? parseFloat(longitude) : 0.0,
            },
        });
        res.json(school);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating the school.');
    }
});

app.get('/api/schools/:name/students', async (req, res) => {
    const schoolName = req.params.name;
    try {
        const school = await prisma.school.findUnique({
            where: { name: schoolName },
            include: {
                users: {
                    include: {
                        profile: true,
                    },
                },
            },
        });

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.json(school.users);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching students.');
    }
});



if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

export default app;
