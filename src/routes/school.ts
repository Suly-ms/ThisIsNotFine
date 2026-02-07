import { Router } from 'express';
import path from 'path';
import { prisma } from '../lib/prisma';
import { requireAdmin } from './auth'; // On réutilise le middleware

const router = Router();

// Route API pour récupérer les écoles (publique ou protégée selon vos besoins)
router.get('/api/schools', async (req, res) => {
    try {
        const schools = await prisma.school.findMany();
        res.json(schools);
    } catch (error) {
        res.status(500).send('Error fetching schools');
    }
});

// Route HTML pour l'admin
router.get('/create-school.html', requireAdmin, (req, res) => {
    // Note: __dirname peut nécessiter un ajustement selon votre config tsconfig/esm
    // Si projectRoot est global, importez-le, sinon on utilise un chemin relatif
    res.sendFile(path.resolve('public', 'create-school.html'));
});

// Création d'école (Admin seulement)
router.post('/api/schools', requireAdmin, async (req, res) => {
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
        res.status(500).send('Error creating school');
    }
});

// Étudiants d'une école
router.get('/api/schools/:name/students', async (req, res) => {
    const schoolName = req.params.name;
    try {
        const school = await prisma.school.findUnique({
            where: { name: schoolName },
            include: {
                users: { include: { profile: true } },
            },
        });
        if (!school) return res.status(404).json({ message: 'School not found' });
        res.json(school.users);
    } catch (error) {
        res.status(500).send('Error fetching students');
    }
});

export default router;