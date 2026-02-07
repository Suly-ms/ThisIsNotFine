import { PrismaClient } from '@prisma/client';

// On instancie Prisma ici pour pouvoir l'importer dans auth.ts, school.ts, etc.
export const prisma = new PrismaClient();