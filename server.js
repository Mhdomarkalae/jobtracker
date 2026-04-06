require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { signup, login, getUserById } = require("./auth");
const { authMiddleware } = require("./middleware");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ==================== AUTH ====================

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const result = await signup(email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ==================== USERS ====================

// Get all users (protected)
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        jobs: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID (protected)
app.get("/api/users/:id", authMiddleware, async (req, res) => {
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

// ==================== JOBS ====================

// Get all jobs for current user (protected)
app.get("/api/jobs", authMiddleware, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.user.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get jobs by user (protected)
app.get("/api/users/:userId/jobs", authMiddleware, async (req, res) => {
  try {
    // Only allow users to see their own jobs
    if (parseInt(req.params.userId) !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const jobs = await prisma.job.findMany({
      where: { userId: parseInt(req.params.userId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job by ID (protected)
app.get("/api/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Only allow users to see their own jobs
    if (job.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job (protected)
app.post("/api/jobs", authMiddleware, async (req, res) => {
  try {
    const { company, position, status, salary, location, notes } = req.body;

    if (!company || !position || !location) {
      return res.status(400).json({
        error: "company, position, and location are required",
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
        userId: req.user.id,
      },
      include: { user: true },
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job (protected)
app.patch("/api/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!job) return res.status(404).json({ error: "Job not found" });

    // Only allow users to update their own jobs
    if (job.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { company, position, status, salary, location, notes } = req.body;

    const updatedJob = await prisma.job.update({
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
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job (protected)
app.delete("/api/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!job) return res.status(404).json({ error: "Job not found" });

    // Only allow users to delete their own jobs
    if (job.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.job.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATS ====================

// Get job stats for current user (protected)
app.get("/api/stats", authMiddleware, async (req, res) => {
  try {
    const total = await prisma.job.count({
      where: { userId: req.user.id },
    });

    const byStatus = await prisma.job.groupBy({
      by: ["status"],
      where: { userId: req.user.id },
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
