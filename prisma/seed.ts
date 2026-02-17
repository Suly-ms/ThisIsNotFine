import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const adminEmail = 'admin@thisisnotfine.fr';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'System',
                email: adminEmail,
                password: hashedPassword,
                admin: true,
                adminVerified: true,
                emailVerified: true,
                userType: 'ADMIN' // or STUDENT with admin=true, but let's use ADMIN if I added it to schema enum? 
                // schema says String @default("STUDENT").
                // Let's use STUDENT but admin=true.
            }
        });
        console.log('Admin user created: admin@thisisnotfine.fr / admin123');
    } else {
        console.log('Admin user already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
