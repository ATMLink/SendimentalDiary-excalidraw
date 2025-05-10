// backend/src/routes/diaries.ts
import express, { Request, Response } from 'express'
import Diary from '../models/Diary'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import type {ParamsDictionary} from 'express-serve-static-core'
import type { ParsedQs} from 'qs'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var'

type MulterDestinationCallback = (error: Error | null, destination: string) => void
type MulterFilenameCallback = (error: Error | null, filename: string) => void

// multer 存储配置
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: MulterDestinationCallback) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (_req: Request, file: Express.Multer.File, cb: MulterDestinationCallback) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const upload = multer({ storage })

type MulterRequest = Request<ParamsDictionary, any, any, ParsedQs> & {
  files: Express.Multer.File[]
}

// POST /api/diaries
// router.post('/', async (req: Request, res: Response) => {
//   const authHeader = req.headers.authorization
//   if (!authHeader) {
//     res.status(401).json({ message: 'No token' })
//     return  // ← 显式返回 void
//   }

//   const token = authHeader.split(' ')[1]
//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

//     // multer 已经把文件存在uploads/ 并放在 req.files
//     const files = req.files as Express.Multer.File[]
//     // 拼出可外网访问的 URL 数组
//     const imageUrls = files.map(f => `/uploads/${f.filename}`)

//     const { title, mood, content, image, tags } = req.body
//     const diary = await Diary.create({
//       title,
//       mood,
//       content,
//       image: imageUrls,
//       tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
//       user: payload.userId,
//     })

//     res.status(201).json(diary)
//     return  // ← 显式返回 void
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: '保存失败', error })
//     return  // ← 显式返回 void
//   }
// })

router.post(
  '/',
  upload.array('images'),
  async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ message: 'No token' })
      return
    }

    try {
      const token = authHeader.split(' ')[1]
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

      console.log('Received files raw:', req.files)
      console.log('Body:', req.body)

      // —— 类型收窄：只有当 req.files 是数组时才用它，否则用空数组
      const rawFiles = req.files
      const files: Express.Multer.File[] = Array.isArray(rawFiles) ? rawFiles : []

      // 这样 .map 就不会报错
      const imageUrls = files.map(f => `/uploads/${f.filename}`)

      const { title, mood, content, tags } = req.body

      if (!title || title.trim() === '') {
        res.status(400).json({ message: '标题不能为空' })
        return
      }

      const diary = await Diary.create({
        title,
        mood,
        content,
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
        image: imageUrls,
        user: payload.userId,
      })

      res.status(201).json(diary)
      return
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: '保存失败', error })
      return
    }
  }
)

export default router
