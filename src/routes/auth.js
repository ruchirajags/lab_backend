const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, rollNo, branch, division } = req.body;

        if (!name || !email || !password || !role)
            return res.status(400).json({ message: "Name, email, password and role are required." });
        if (!["student", "authority"].includes(role))
            return res.status(400).json({ message: "Role must be 'student' or 'authority'." });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ message: "Email already registered." });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name, email, password: passwordHash, role,
                rollNo: role === "student" ? rollNo : null,
                branch: role === "student" ? branch : null,
                division: role === "student" ? division : null,
            },
        });

        res.status(201).json({
            message: "Registered successfully.",
            user: { id: user.id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, branch: user.branch, division: user.division },
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error during registration." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required." });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, branch: user.branch, division: user.division },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login." });
    }
});

module.exports = router;