/**
 * Instance globale Prisma Client.
 * Est exportée pour être réutilisée dans toutes les routes au lieu de créer de nouvelles connexions.
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();