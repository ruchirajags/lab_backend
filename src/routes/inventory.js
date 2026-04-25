const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { protect, requireRole } = require("../middleware/auth");

const prisma = new PrismaClient();

// ── GET /api/inventory ───────────────────────────────────────────────────────
// Authority only: get all inventory items
// Optional query: ?category=computer | instrument | chemical
//                 ?condition=good | needs_repair | damaged
router.get("/", protect, requireRole("authority"), async (req, res) => {
    try {
        const { category, condition } = req.query;

        const where = {};
        if (category) where.category = category;
        if (condition) where.condition = condition;

        const items = await prisma.inventory.findMany({
            where,
            orderBy: { name: "asc" },
        });

        res.json(items);
    } catch (err) {
        console.error("Get inventory error:", err);
        res.status(500).json({ message: "Server error fetching inventory." });
    }
});

// ── GET /api/inventory/:id ───────────────────────────────────────────────────
// Authority only: get a single inventory item
router.get("/:id", protect, requireRole("authority"), async (req, res) => {
    try {
        const item = await prisma.inventory.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (!item) return res.status(404).json({ message: "Item not found." });
        res.json(item);
    } catch (err) {
        console.error("Get item error:", err);
        res.status(500).json({ message: "Server error fetching item." });
    }
});

// ── POST /api/inventory ──────────────────────────────────────────────────────
// Authority only: add a new inventory item
// Body: { name, category, quantity, condition, location }
router.post("/", protect, requireRole("authority"), async (req, res) => {
    try {
        const { name, category, quantity, condition = "good", location } = req.body;

        if (!name || !category || quantity === undefined || !location) {
            return res.status(400).json({ message: "name, category, quantity, and location are required." });
        }

        const validCategories = ["computer", "instrument", "chemical"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: `Category must be one of: ${validCategories.join(", ")}` });
        }

        const item = await prisma.inventory.create({
            data: { name, category, quantity: parseInt(quantity), condition, location },
        });

        res.status(201).json(item);
    } catch (err) {
        console.error("Create inventory error:", err);
        res.status(500).json({ message: "Server error creating inventory item." });
    }
});

// ── PATCH /api/inventory/:id ─────────────────────────────────────────────────
// Authority only: update any fields on an inventory item
// Body: any subset of { name, category, quantity, condition, location }
router.patch("/:id", protect, requireRole("authority"), async (req, res) => {
    try {
        const { name, category, quantity, condition, location } = req.body;

        const item = await prisma.inventory.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!item) return res.status(404).json({ message: "Item not found." });

        // Build update object from only the fields that were sent
        const data = {};
        if (name !== undefined) data.name = name;
        if (category !== undefined) data.category = category;
        if (quantity !== undefined) data.quantity = parseInt(quantity);
        if (condition !== undefined) data.condition = condition;
        if (location !== undefined) data.location = location;

        const updated = await prisma.inventory.update({
            where: { id: parseInt(req.params.id) },
            data,
        });

        res.json(updated);
    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Server error updating inventory item." });
    }
});

// ── DELETE /api/inventory/:id ────────────────────────────────────────────────
// Authority only: remove an inventory item
router.delete("/:id", protect, requireRole("authority"), async (req, res) => {
    try {
        const item = await prisma.inventory.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!item) return res.status(404).json({ message: "Item not found." });

        await prisma.inventory.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Item deleted." });
    } catch (err) {
        console.error("Delete inventory error:", err);
        res.status(500).json({ message: "Server error deleting item." });
    }
});

module.exports = router;