import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/api/me', async (req, res) => {
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

router.put('/api/me/profile', async (req, res) => {
    const session = req.session as { userId?: number };
    if (!session.userId) return res.status(401).send('Unauthorized');

    const { searchType, searchStatus, linkedin, github, portfolio, studyDomain } = req.body;

    try {
        const profile = await prisma.studentProfile.upsert({
            where: { userId: session.userId },
            update: {
                searchType, searchStatus, linkedin, github, portfolio, studyDomain
            },
            create: {
                userId: session.userId,
                searchType: searchType || "Stage",
                searchStatus: searchStatus || "En recherche",
                linkedin, github, portfolio, studyDomain
            }
        });
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating profile');
    }
});

router.delete('/api/me/profile', async (req, res) => {
    const session = req.session as { userId?: number };
    if (!session.userId) return res.status(401).send('Unauthorized');

    try {
        await prisma.studentProfile.deleteMany({
            where: { userId: session.userId }
        });

        await prisma.user.delete({
            where: { id: session.userId }
        });

        req.session.destroy((err) => {
            if (err) {
                console.error("Erreur destruction session", err);
                return res.status(500).send("Erreur lors de la déconnexion");
            }
            res.status(200).send("Compte supprimé avec succès");
        });

    } catch (error) {
        console.error("Erreur suppression compte:", error);
        res.status(500).send("Erreur lors de la suppression du compte");
    }
});

export default router;