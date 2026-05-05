const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { protect, requireRole } = require("../middleware/auth");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'labos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

const prisma = new PrismaClient();

// ── POST /api/issues ─────────────────────────────────────────────────────────
// Student: report a new issue
// Body: { title, description, equipment, priority }
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, equipment, priority = 'medium', labRoom, component } = req.body;
    const imageUrl = req.file.path;

    if (!title || !description || !equipment) {
      return res.status(400).json({ message: 'title, description, and equipment are required.' });
    }

    const issue = await prisma.issue.create({
      data: {
        title, description, equipment,
        priority, status: 'open',
        labRoom: labRoom || null,
        component: component || null,
        imageUrl,
        studentId: req.user.id,
      },
      include: { student: true }
    });
    res.status(201).json(issue);
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ message: 'Server error creating issue.' });
  }
});

// ── GET /api/issues/mine ─────────────────────────────────────────────────────
// Student: get only their own issues
// NOTE: this route must come before GET /:id to avoid "mine" being treated as an id
router.get("/mine", protect, async (req, res) => {
    try {
        const issues = await prisma.issue.findMany({
            where: { studentId: req.user.id },
            orderBy: { createdAt: "desc" },
        });
        res.json(issues);
    } catch (err) {
        console.error("Get my issues error:", err);
        res.status(500).json({ message: "Server error fetching your issues." });
    }
});

// ── GET /api/issues ──────────────────────────────────────────────────────────
// Authority only: get all issues with optional status filter
// Query params: ?status=open | in_progress | resolved
router.get("/", protect, requireRole("authority"), async (req, res) => {
    try {
        const { status } = req.query;

        const issues = await prisma.issue.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            include: { student: true },
        });

        res.json(issues);
    } catch (err) {
        console.error("Get all issues error:", err);
        res.status(500).json({ message: "Server error fetching issues." });
    }
});

// ── PUT /api/issues/:id ──────────────────────────────────────────────────────
// Student: update their own issue
// Body: { title, description, priority, equipment, component, labRoom }
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, priority, equipment, component, labRoom } = req.body;
    const issue = await prisma.issue.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, priority, equipment, component, labRoom }
    });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// ── GET /api/issues/:id ──────────────────────────────────────────────────────
// Both roles: get a single issue by ID
// Students can only view their own; authorities can view any
router.get("/:id", protect, async (req, res) => {
    try {
        const issue = await prisma.issue.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { student: true },
        });

        if (!issue) return res.status(404).json({ message: "Issue not found." });

        // Students can only see their own issues
        if (req.user.role === "student" && issue.studentId !== req.user.id) {
            return res.status(403).json({ message: "Access denied." });
        }

        res.json(issue);
    } catch (err) {
        console.error("Get issue error:", err);
        res.status(500).json({ message: "Server error fetching issue." });
    }
});

// ── PATCH /api/issues/:id/status ─────────────────────────────────────────────
// Authority only: update the status of an issue
// Body: { status } — "open" | "in_progress" | "resolved"
router.patch("/:id/status", protect, requireRole("authority"), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["open", "in_progress", "resolved"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
        }

        const issue = await prisma.issue.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!issue) return res.status(404).json({ message: "Issue not found." });

        const updated = await prisma.issue.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
            include: { student: true },
        });

        res.json(updated);
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ message: "Server error updating issue status." });
    }
});

// ── DELETE /api/issues/:id ───────────────────────────────────────────────────
// Authority only: delete an issue
router.delete('/:id', protect, async (req, res) => {
  try {
    await prisma.issue.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

module.exports = router;