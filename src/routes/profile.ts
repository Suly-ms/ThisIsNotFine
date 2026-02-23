/**
 * Gestion du profil utilisateur.
 * Permet à l'utilisateur connecté de récupérer ou modifier
 * ses informations personnelles, son mot de passe ou de supprimer son compte.
 */
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import upload from '../lib/upload';

const router = Router();

router.get('/api/me', async (req, res) => {
    const session = req.session as { userId?: number };
    if (session.userId) {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { profile: true, companyProfile: true }
        });
        if (user) {
            res.json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                admin: user.admin,
                profile: user.profile,
                companyProfile: user.companyProfile,
                userType: user.userType,
                email: user.email
            });
        } else {
            res.status(404).send('User not found');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

router.put('/api/me/profile', upload.single('cv'), async (req, res) => {
    const session = req.session as { userId?: number };
    if (!session.userId) return res.status(401).send('Unauthorized');

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return res.status(404).send('User not found');

    try {
        if (user.userType === 'COMPANY') {
            const { companyName, companyWebsite, companyDescription } = req.body;
            const updatedCompany = await prisma.companyProfile.upsert({
                where: { userId: session.userId },
                update: {
                    name: companyName,
                    website: companyWebsite,
                    description: companyDescription
                },
                create: {
                    userId: session.userId,
                    name: companyName,
                    website: companyWebsite,
                    description: companyDescription
                }
            });
            res.json(updatedCompany);
        } else {
            const { searchType, searchStatus, linkedin, github, portfolio, studyDomain, bio } = req.body;
            const cvFile = req.file;

            const updateData: any = {
                searchType, searchStatus, linkedin, github, portfolio, studyDomain, bio
            };

            if (cvFile) {
                updateData.cvPath = `/uploads/cv/${cvFile.filename}`;
            }

            const profile = await prisma.studentProfile.upsert({
                where: { userId: session.userId },
                update: updateData,
                create: {
                    userId: session.userId,
                    searchType: searchType || "Stage",
                    searchStatus: searchStatus || "En recherche",
                    linkedin, github, portfolio, studyDomain, bio,
                    cvPath: cvFile ? `/uploads/cv/${cvFile.filename}` : undefined
                }
            });
            res.json(profile);
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating profile');
    }
});

router.put('/api/me/password', async (req, res) => {
    const session = req.session as { userId?: number };
    if (!session.userId) return res.status(401).send('Unauthorized');

    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 3) {
        return res.status(400).send('Le nouveau mot de passe est trop court.');
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) return res.status(404).send('Utilisateur non trouvé.');

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).send('Mot de passe actuel incorrect.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.status(200).send('Mot de passe mis à jour avec succès.');
    } catch (error) {
        console.error("Erreur changement mot de passe:", error);
        res.status(500).send('Erreur serveur lors du changement de mot de passe.');
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