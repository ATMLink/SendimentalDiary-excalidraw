import express, { Request, Response, RequestHandler, NextFunction } from 'express';
// FIX: 导入 mongoose 的 Types，用于类型转换
import { Types } from 'mongoose';
import Wish, { IWish } from '../models/Wish'; // 确保 Wish 模型路径正确
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var';

interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}

const authenticateToken: RequestHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'No token' });
        return; 
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.user = payload;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// POST /wishes - 创建一个新愿望
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { content, note } = req.body;
        const userId = req.user?.userId;
        if (!content) {
            res.status(400).json({ message: 'Content is required' });
            return;
        }
        const wish = await Wish.create({
            content,
            note,
            createdBy: userId,
            status: 'pending',
        });
        const populatedWish = await wish.populate<{ createdBy: { _id: string, username: string, color: string } }>({ path: 'createdBy', select: 'username color' });
        res.status(201).json(populatedWish);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create wish', error });
    }
});

// GET /wishes - 获取愿望列表
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const filter: { status?: string } = {};
        if (status && ['pending', 'fulfilled'].includes(status as string)) {
            filter.status = status as string;
        }
        const wishes = await Wish.find(filter)
            .populate('createdBy', 'username color')
            .populate('fulfilledBy', 'username color')
            .sort({ createdAt: -1 });
        res.json(wishes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch wishes', error });
    }
});

// PUT /wishes/:id - 更新一个愿望
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const userId = req.user?.userId;

        const wish = await Wish.findById(id);
        if (!wish) {
            res.status(404).json({ message: 'Wish not found' });
            return;
        }

        const updateData: Partial<IWish> = {};
        if (status) updateData.status = status;
        if (note !== undefined) updateData.note = note;
        
        if (status === 'fulfilled' && userId) {
            // FIX: 将 userId 字符串转换为 ObjectId 类型
            updateData.fulfilledBy = new Types.ObjectId(userId);
        }

        const updatedWish = await Wish.findByIdAndUpdate(id, updateData, { new: true })
            .populate('createdBy', 'username color')
            .populate('fulfilledBy', 'username color');
            
        res.json(updatedWish);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update wish', error });
    }
});

export default router;
