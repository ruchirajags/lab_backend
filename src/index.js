const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('DB ping OK');
  } catch (e) {
    console.log('DB ping failed, will retry...');
  }
}, 4 * 60 * 1000);

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/uploads', require('express').static('uploads'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/inventory", require("./routes/inventory"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "LabOS API running" }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`LabOS API running on port ${PORT}`);
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection verified');
  } catch (e) {
    console.log('Warning: Database not reachable on startup — will retry on requests');
  }
});