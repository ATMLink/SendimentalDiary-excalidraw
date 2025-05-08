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

export default router
