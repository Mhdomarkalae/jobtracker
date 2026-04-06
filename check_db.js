const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      include: { jobs: true }
    });
    console.log('=== USERS ===');
    console.log(JSON.stringify(users, null, 2));
    
    const jobs = await prisma.job.findMany({
      include: { user: true }
    });
    console.log('\n=== JOBS ===');
    console.log(JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
