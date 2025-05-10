// backend/src/routes/diaries.ts
import express, { Request, Response } from 'express'
import Diary from '../models/Diary'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import type {ParamsDictionary} from 'express-serve-static-core'
import type { ParsedQs} from 'qs'
import Tag from '../models/Tag'
import fs from 'fs'

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

      const rawTags = Array.isArray(tags) ? tags : tags ? [tags] : []

      // 存储tags(去重，存入数据库)
      for(const tagName of rawTags){
        if(tagName.trim()){
          await Tag.updateOne(
            {name: tagName},
            {$setOnInsert: {name: tagName}},
            {upsert: true}
          )
        }
      }

      const diary = await Diary.create({
        title,
        mood,
        content,
        tags: rawTags,
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

router.get('/tags', async (req: Request, res: Response) => {
  try{
    const tags = await Tag.find({}, 'name').sort({name: 1})
    res.json(tags.map(tag => tag.name))
  }catch(error){
    console.error(error)
    res.status(500).json({message: '获取标签失败'})
  }
})

router.patch(
  '/:id',
  upload.single('images'),
  async (req: Request<{ id: string }>, res: Response) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ message: 'No token' })
      return
    }

    try {
      const token = authHeader.split(' ')[1]
      jwt.verify(token, JWT_SECRET)  // 仅校验，无需取 payload

      const diary = await Diary.findById(req.params.id)
      if (!diary) {
        res.status(404).json({ message: 'Not found' })
        return
      }

      // 如果上传了新图，就删掉旧图
      if (req.file) {
        (diary.image || []).forEach((url: string) => {
          const filePath = path.join(__dirname, '../../uploads', path.basename(url))
          fs.unlink(filePath, err => { if (err) console.error(err) })
        })
        diary.image = [`/uploads/${req.file.filename}`]
      }

      const { title, mood, tags } = req.body
      if (title) diary.title = title
      if (mood) diary.mood = mood
      diary.tags = Array.isArray(tags) ? tags : tags ? [tags] : []

      await diary.save()
      res.json(diary)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: '更新失败', error: err })
      return
    }
  }
)

export default router
