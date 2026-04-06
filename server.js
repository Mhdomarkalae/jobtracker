require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ==================== USERS ====================

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { jobs: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { jobs: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
app.post("/api/users", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await prisma.user.create({
      data: { email },
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// ==================== JOBS ====================

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get jobs by user
app.get("/api/users/:userId/jobs", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: parseInt(req.params.userId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job by ID
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job
app.post("/api/jobs", async (req, res) => {
  try {
    const { company, position, status, salary, location, notes, userId } = req.body;

    if (!company || !position || !location || !userId) {
      return res.status(400).json({
        error: "company, position, location, and userId are required",
      });
    }

    const job = await prisma.job.create({
      data: {
        company,
        position,
        status: status || "APPLIED",
        salary,
        location,
        notes,
        userId: parseInt(userId),
      },
      include: { user: true },
    });
    res.status(201).json(job);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(400).json({ error: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update job
app.patch("/api/jobs/:id", async (req, res) => {
  try {
    const { company, position, status, salary, location, notes } = req.body;

    const job = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(company && { company }),
        ...(position && { position }),
        ...(status && { status }),
        ...(salary !== undefined && { salary }),
        ...(location && { location }),
        ...(notes !== undefined && { notes }),
      },
      include: { user: true },
    });
    res.json(job);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await prisma.job.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATS ====================

// Get job stats
app.get("/api/stats", async (req, res) => {
  try {
    const total = await prisma.job.count();
    const byStatus = await prisma.job.groupBy({
      by: ["status"],
      _count: true,
    });

    const stats = {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api/health`);
});
