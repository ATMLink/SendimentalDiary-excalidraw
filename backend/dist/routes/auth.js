"use strict";
// file: backend/src/routes/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// replaced above: router initialized via express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var';
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, color } = req.body;
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ username, password: hash, email, color });
        res.status(201).json({ id: user._id, username: user.username, email: user.email, color: user.color });
    }
    catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User_1.default.findOne({ username });
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email ?? '',
                color: user.color ?? ''
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});
// GET /api/auth/me
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).end();
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.default.findById(payload.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(401).json({ message: 'Unauthorized', error });
    }
});
exports.default = router;
