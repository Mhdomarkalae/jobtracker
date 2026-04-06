const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-change-in-production";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION_MS || "86400000"; // 24 hours

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: Math.floor(JWT_EXPIRATION / 1000) } // Convert to seconds
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Compare passwords
async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

// Signup
async function signup(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
    },
  });

  return {
    token: generateToken(user),
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

// Login
async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return {
    token: generateToken(user),
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

// Get user by ID
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  signup,
  login,
  getUserById,
};
