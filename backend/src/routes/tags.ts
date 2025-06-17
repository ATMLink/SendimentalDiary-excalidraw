// backend/src/routes/tags.ts
import express, { Request, Response } from 'express';
import Tag from '../models/Tag';

const router = express.Router();

// GET /api/tags - 获取所有不重复的标签名
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const tags = await Tag.find({}, 'name').sort({ name: 1 });
        // 直接返回字符串数组
        res.json(tags.map(t => t.name));
    } catch (error) {
        console.error('获取标签失败:', error);
        res.status(500).json({ message: '获取标签失败' });
    }
});

export default router;