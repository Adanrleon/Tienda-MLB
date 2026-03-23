const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: { not: null } },
    select: { email: true, resetPasswordToken: true }
  });
  console.log(JSON.stringify(user));
}

main().catch(console.error).finally(() => prisma.$disconnect());
