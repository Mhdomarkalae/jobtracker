#!/usr/bin/env node
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Creating test user...");
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@jobtracker.com`,
      },
    });
    console.log("✅ User created:", user);

    console.log("\n🔄 Creating test job...");
    const job = await prisma.job.create({
      data: {
        company: "Tech Corp",
        position: "Senior Engineer",
        status: "APPLIED",
        salary: "$150,000 - $180,000",
        location: "San Francisco, CA",
        notes: "Test job application",
        userId: user.id,
      },
    });
    console.log("✅ Job created:", job);

    console.log("\n🔄 Fetching jobs for user...");
    const userWithJobs = await prisma.user.findUnique({
      where: { id: user.id },
      include: { jobs: true },
    });
    console.log("✅ User with jobs:", userWithJobs);

    console.log("\n🔄 Updating job status...");
    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: { status: "INTERVIEWING" },
    });
    console.log("✅ Job updated:", updatedJob);

    console.log("\n🔄 Fetching all jobs...");
    const allJobs = await prisma.job.findMany({
      include: { user: true },
    });
    console.log("✅ All jobs:", allJobs);

    console.log("\n✨ All tests passed! Supabase + Prisma is working correctly.");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
