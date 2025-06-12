// backend/src/routes/diaries.ts
import express, { Request, Response, RequestHandler } from 'express';
import Diary from '../models/Diary';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Tag from '../models/Tag';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var';

// 上传目录
const uploadDir = path.join(__dirname, '../../uploads');
const contentImgDir = path.join(uploadDir, 'contentImg');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(contentImgDir)) fs.mkdirSync(contentImgDir);

// multer 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'snapshot' ? uploadDir : contentImgDir;
    if (file.fieldname !== 'snapshot' && !fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: {  fieldSize: 25 * 1024 * 1024, files: 50, fields: 50, fileSize: 100 * 1024 * 1024 } });

// JWT 认证中间件
const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'No token' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).user = payload;
    next();
    return;
  } catch {
    res.status(403).json({ message: 'Invalid token' });
    return;
  }
};

// 处理内容与文件
const processContentAndFiles = (req: Request): { content: string; snapshotUrl: string | null } => {
    const { content } = req.body;
    if (!content) {
        return { content: JSON.stringify({ elements: [], appState: {}, files: {} }), snapshotUrl: null };
    }

    const contentObject = JSON.parse(content);
    const uploadedFiles = req.files as Express.Multer.File[] | undefined;
    let snapshotUrl: string | null = null;

    if (uploadedFiles) {
        if (!contentObject.files) contentObject.files = {};
        
        uploadedFiles.forEach(file => {
            const fileId = file.fieldname;
            
            // --- 这是最关键的修复 ---
            // 从文件的绝对路径中，只截取 "uploads" 之后的部分
            const relativePath = file.path.substring(file.path.indexOf('uploads'));
            // 将 Windows 的路径分隔符 '\' 替换为 URL 标准的 '/'
            const url = '/' + relativePath.replace(/\\/g, '/'); 

            if (fileId === 'snapshot') {
                snapshotUrl = url;
            } else if (contentObject.files[fileId]) {
                contentObject.files[fileId].url = url;
                delete contentObject.files[fileId].dataURL;
            }
        });
    }
    
    return {
        content: JSON.stringify(contentObject),
        snapshotUrl
    };
};

// 创建日记
router.post(
  '/',
  authenticateToken,
  upload.any(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, mood, tags } = req.body;
      const userId = (req as any).user.userId;
      if (!title || title.trim() === '') {
        res.status(400).json({ message: '标题不能为空' });
        return;
      }
      const { content: finalContent, snapshotUrl } = processContentAndFiles(req);
      const rawTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
      for (const tagName of rawTags) {
        if (tagName.trim()) {
          await Tag.updateOne({ name: tagName }, { $setOnInsert: { name: tagName } }, { upsert: true });
        }
      }
      const diary = await Diary.create({ title, mood, content: finalContent, tags: rawTags, image: snapshotUrl ? [snapshotUrl] : [], user: userId });
      res.status(201).json(diary);
    } catch (error) {
      console.error('Save error:', error);
      res.status(500).json({ message: '保存失败', error });
    }
  }
);

// 更新日记
router.patch(
  '/:id',
  authenticateToken,
  upload.any(),
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const diary = await Diary.findById(req.params.id);
      if (!diary) {
        res.status(404).json({ message: 'Not found' });
        return;
      }
      const { title, mood, tags } = req.body;
      if (title) diary.title = title;
      if (mood) diary.mood = mood;
      const { content: finalContent, snapshotUrl } = processContentAndFiles(req);
      diary.content = finalContent;
      if (snapshotUrl) {
        if (diary.image?.length) {
          const oldPath = path.join(__dirname, '../../', diary.image[0]);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        diary.image = [snapshotUrl];
      }
      diary.tags = Array.isArray(tags) ? tags : tags ? [tags] : [];
      for (const tagName of diary.tags) {
        if (tagName.trim()) {
          await Tag.updateOne({ name: tagName }, { $setOnInsert: { name: tagName } }, { upsert: true });
        }
      }
      await diary.save();
      res.json(diary);
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ message: '更新失败', error: err });
    }
  }
);

// 获取单个日记
router.get(
  '/:id',
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const diary = await Diary.findById(req.params.id);
      if (!diary) {
        res.status(404).json({ message: 'Diary not found' });
        return;
      }
      res.json(diary);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取日记失败', error: err });
    }
  }
);

// 列出标签
router.get(
  '/tags',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const tags = await Tag.find({}, 'name').sort({ name: 1 });
      res.json(tags.map(t => t.name));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '获取标签失败' });
    }
  }
);

export default router;
