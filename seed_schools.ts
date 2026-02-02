
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.school.count();
    console.log(`Schools count: ${count}`);
    if (count === 0) {
        console.log("Seeding schools...");
        await prisma.school.create({
            data: {
                name: 'Epitech',
                latitude: 48.8156,
                longitude: 2.3631
            }
        });
        await prisma.school.create({
            data: {
                name: '42',
                latitude: 48.8966,
                longitude: 2.3183
            }
        });
        console.log("Seeded Epitech and 42.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
