/**
 * Routes d'administration.
 * Permet de gérer les utilisateurs (bannissement, suppression) et
 * de valider les comptes entreprises en attente.
 * Accessible uniquement aux utilisateurs avec le flag `admin` à `true`.
 */
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from './auth';

const router = Router();

// Routes protégées Admin
router.use('/api/admin', requireAdmin);

// Récupérer les entreprises en attente
router.get('/api/admin/pending-companies', async (req, res) => {
    try {
        const companies = await prisma.user.findMany({
            where: {
                userType: 'COMPANY',
                adminVerified: false
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                companyProfile: true, // Inclure le profil entreprise
                createdAt: true
            }
        });
        res.json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des entreprises en attente.');
    }
});

// Valider une entreprise
router.post('/api/admin/verify-company/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                adminVerified: true,
                emailVerified: true // Auto-verify email when admin approves
            }
        });
        res.json({ success: true, message: 'Entreprise validée.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la validation.');
    }
});

// Rejeter/Supprimer une entreprise
router.post('/api/admin/reject-company/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        await prisma.companyProfile.delete({ where: { userId } }).catch(() => { });
        await prisma.user.delete({ where: { id: userId } });
        res.json({ success: true, message: 'Entreprise rejetée et supprimée.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du rejet.');
    }
});



// --- Gestion des Utilisateurs ---

// Récupérer tous les utilisateurs
router.get('/api/admin/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                userType: true,
                banExpiresAt: true,
                admin: true
            },
            orderBy: { id: 'asc' }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des utilisateurs.');
    }
});

// Bannir un utilisateur
router.post('/api/admin/users/:id/ban', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { durationDays, indefinite } = req.body; // durationDays in days, indefinite boolean

    try {
        let banExpiresAt: Date | null = null;
        if (indefinite) {
            banExpiresAt = new Date('9999-12-31T23:59:59Z');
        } else if (durationDays) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(durationDays));
            banExpiresAt = date;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { banExpiresAt }
        });

        res.json({ success: true, message: 'Utilisateur banni.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du bannissement.');
    }
});

// Débannir un utilisateur
router.post('/api/admin/users/:id/unban', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { banExpiresAt: null }
        });
        res.json({ success: true, message: 'Utilisateur débanni.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du débannissement.');
    }
});

// Supprimer un utilisateur
router.delete('/api/admin/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        await prisma.user.delete({ where: { id: userId } });
        res.json({ success: true, message: 'Utilisateur supprimé.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression.');
    }
});

export default router;
