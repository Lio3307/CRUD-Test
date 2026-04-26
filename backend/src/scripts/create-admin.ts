import prisma from '../config/database.js';

async function main() {
  const userId = 'user_3CrORE1hJcwsElUdMnpQaRveXJg';

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { role: 'ADMIN' },
    create: {
      id: userId,
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('User created/updated:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
