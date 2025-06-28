// file: backend/src/routes/auth.ts

import express, { Request, Response } from 'express'
const router = express.Router()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

// replaced above: router initialized via express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var'

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, color } = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hash, email, color })
    res.status(201).json({ id: user._id, username: user.username, email: user.email, color: user.color })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) { res.status(401).json({ message: 'User not found' }); return }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) { res.status(401).json({ message: 'Invalid password' }); return }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email ?? '',
            color: user.color ?? ''
        }
     })
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error })
  }
})

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader) { res.status(401).end(); return }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await User.findById(payload.userId).select('-password')
    if (!user) { res.status(404).json({ message: 'User not found' }); return }
    res.json(user)
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized', error })
  }
})

// POST /api/auth/pair
// 用于配对两个用户
router.post('/pair', async (req: Request, res: Response) => {
    console.log('--- 配对 API 开始 ---');
    try {
        const { user1_username, user2_username } = req.body;
        console.log(`收到的用户名: ${user1_username}, ${user2_username}`);

        if (!user1_username || !user2_username) {
            console.log('错误: 用户名不完整');
            res.status(400).json({ message: '需要提供两个用户名' });
            return 
        }

        const user1 = await User.findOne({ username: user1_username });
        const user2 = await User.findOne({ username: user2_username });

        if (!user1 || !user2) {
            console.log('错误: 未找到用户。 User1:', user1, 'User2:', user2);
            res.status(404).json({ message: '一个或两个用户未找到' });
            return 
        }

        console.log(`找到了用户: User1 ID: ${user1._id}, User2 ID: ${user2._id}`);
        console.log('准备执行更新操作...');

        // --- 核心修改：使用 { new: true } 选项来获取并返回更新后的文档 ---
        const [updatedUser1, updatedUser2] = await Promise.all([
            User.findByIdAndUpdate(user1._id, { $set: { partner: user2._id } }, { new: true }),
            User.findByIdAndUpdate(user2._id, { $set: { partner: user1._id } }, { new: true })
        ]);
        
        console.log('--- 更新操作完成 ---');
        console.log('更新后的 User1:', updatedUser1);
        console.log('更新后的 User2:', updatedUser2);

        // 最终检查，确保 partner 字段真的被设置了
        if (!updatedUser1?.partner || !updatedUser2?.partner) {
            console.log('严重错误: 更新后，partner 字段依然为空！');
            res.status(500).json({ message: '数据库更新失败，请检查服务器日志！' });
            return 
        }

        console.log('配对成功！准备发送响应。');
        // 在响应中也返回更新后的用户数据，方便前端确认
        res.status(200).json({ 
            message: `配对成功: ${user1.username} <-> ${user2.username}`,
            data: { user1: updatedUser1, user2: updatedUser2 }
        });

    } catch (error) {
        console.error('配对过程中捕获到严重错误:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(500).json({ message: '配对失败', error: errorMessage });
    }
});
export default router
