// backend/src/routes/moods.ts

import express, { Response } from 'express';
import User from '../models/User';
// 导入我们修正后的中间件和自定义请求类型
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// 现在，当 authenticateToken 成功后，这里的 req 会被正确地识别为 AuthenticatedRequest
router.put('/update', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moodValue } = req.body;
        const userId = req.user?.userId; // 现在可以安全地访问

        if (!userId) {
            res.status(403).json({ message: '无法识别用户' });
            return 
        }

        if (typeof moodValue !== 'number' || moodValue < 0 || moodValue > 100) {
            res.status(400).json({ message: '心情值必须是 0 到 100 之间的数字' });
            return 
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { moodValue: Math.round(moodValue) } },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ message: '用户不存在' });
            return 
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: '更新心情值失败', error });
    }
});

export default router;