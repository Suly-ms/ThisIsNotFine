/**
 * Moteur de recherche d'étudiants.
 * Recherche multi-critères (nom, prénom, bio, domaine).
 */
import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/api/students', async (req, res) => {
    const { q } = req.query;
    const query = q ? String(q) : undefined;

    try {
        const students = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: query ? [
                            { firstName: { contains: query, mode: 'insensitive' } },
                            { lastName: { contains: query, mode: 'insensitive' } },
                            { profile: { bio: { contains: query, mode: 'insensitive' } } },
                            { profile: { studyDomain: { contains: query, mode: 'insensitive' } } }
                        ] : undefined
                    },
                    { profile: { isNot: null } } // Only users with profiles
                ]
            },
            include: {
                profile: true,
                school: true
            },
            take: 50 // Limit results
        });
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error searching students');
    }
});

export default router;
