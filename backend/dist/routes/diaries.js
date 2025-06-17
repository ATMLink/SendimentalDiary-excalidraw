"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/diaries.ts
const express_1 = __importDefault(require("express"));
const Diary_1 = __importDefault(require("../models/Diary"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Tag_1 = __importDefault(require("../models/Tag"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-env-var';
// 上传目录
const uploadDir = path_1.default.join(__dirname, '../../uploads');
const contentImgDir = path_1.default.join(uploadDir, 'contentImg');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir);
if (!fs_1.default.existsSync(contentImgDir))
    fs_1.default.mkdirSync(contentImgDir);
// multer 存储配置
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.fieldname === 'snapshot' ? uploadDir : contentImgDir;
        if (file.fieldname !== 'snapshot' && !fs_1.default.existsSync(dest))
            fs_1.default.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({ storage, limits: { fieldSize: 25 * 1024 * 1024, files: 50, fields: 50, fileSize: 100 * 1024 * 1024 } });
// JWT 认证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'No token' });
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
        return;
    }
    catch {
        res.status(403).json({ message: 'Invalid token' });
        return;
    }
};
// 处理内容与文件
const processContentAndFiles = (req) => {
    const { content } = req.body;
    if (!content) {
        return { content: JSON.stringify({ elements: [], appState: {}, files: {} }), snapshotUrl: null };
    }
    const contentObject = JSON.parse(content);
    const uploadedFiles = req.files;
    let snapshotUrl = null;
    if (uploadedFiles) {
        if (!contentObject.files)
            contentObject.files = {};
        uploadedFiles.forEach(file => {
            const fileId = file.fieldname;
            // --- 这是最关键的修复 ---
            // 从文件的绝对路径中，只截取 "uploads" 之后的部分
            const relativePath = file.path.substring(file.path.indexOf('uploads'));
            // 将 Windows 的路径分隔符 '\' 替换为 URL 标准的 '/'
            const url = '/' + relativePath.replace(/\\/g, '/');
            if (fileId === 'snapshot') {
                snapshotUrl = url;
            }
            else if (contentObject.files[fileId]) {
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
router.post('/', authenticateToken, upload.any(), async (req, res) => {
    try {
        const { title, mood, tags } = req.body;
        const userId = req.user.userId;
        if (!title || title.trim() === '') {
            res.status(400).json({ message: '标题不能为空' });
            return;
        }
        const { content: finalContent, snapshotUrl } = processContentAndFiles(req);
        const rawTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
        for (const tagName of rawTags) {
            if (tagName.trim()) {
                await Tag_1.default.updateOne({ name: tagName }, { $setOnInsert: { name: tagName } }, { upsert: true });
            }
        }
        const diary = await Diary_1.default.create({ title, mood, content: finalContent, tags: rawTags, image: snapshotUrl ? [snapshotUrl] : [], user: userId });
        res.status(201).json(diary);
    }
    catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ message: '保存失败', error });
    }
});
// 更新日记
router.patch('/:id', authenticateToken, upload.any(), async (req, res) => {
    try {
        const diary = await Diary_1.default.findById(req.params.id);
        if (!diary) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        const { title, mood, tags } = req.body;
        if (title)
            diary.title = title;
        if (mood)
            diary.mood = mood;
        const { content: finalContent, snapshotUrl } = processContentAndFiles(req);
        diary.content = finalContent;
        if (snapshotUrl) {
            if (diary.image?.length) {
                const oldPath = path_1.default.join(__dirname, '../../', diary.image[0]);
                if (fs_1.default.existsSync(oldPath))
                    fs_1.default.unlinkSync(oldPath);
            }
            diary.image = [snapshotUrl];
        }
        diary.tags = Array.isArray(tags) ? tags : tags ? [tags] : [];
        for (const tagName of diary.tags) {
            if (tagName.trim()) {
                await Tag_1.default.updateOne({ name: tagName }, { $setOnInsert: { name: tagName } }, { upsert: true });
            }
        }
        await diary.save();
        res.json(diary);
    }
    catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: '更新失败', error: err });
    }
});
// 获取单个日记
router.get('/:id', async (req, res) => {
    try {
        const diary = await Diary_1.default.findById(req.params.id);
        if (!diary) {
            res.status(404).json({ message: 'Diary not found' });
            return;
        }
        res.json(diary);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取日记失败', error: err });
    }
});
// GET /api/diaries - 获取当前用户的所有日记
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { mood, tags, search } = req.query;
        const filter = { user: userId };
        if (mood) {
            filter.mood = mood;
        }
        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];
            if (tagsArray.length > 0) {
                filter.tags = { $in: tagsArray };
            }
        }
        if (search) {
            // 使用正则表达式进行模糊搜索，i 表示不区分大小写
            filter.title = { $regex: search, $options: 'i' };
        }
        // console.log('Sending to MongoDB:', filter); 
        const diaries = await Diary_1.default.find(filter).sort({ createdAt: -1 }); // 按创建时间倒序
        // const diaries = await Diary.find({ user: userId }).sort({ createdAt: -1 }); // 按创建时间倒序
        res.json(diaries);
    }
    catch (error) {
        console.error('Fetch diaries error:', error);
        res.status(500).json({ message: '获取日记列表失败', error });
    }
});
// 列出标签
// router.get(
//   '/tags',
//   async (_req: Request, res: Response): Promise<void> => {
//     try {
//       const tags = await Tag.find({}, 'name').sort({ name: 1 });
//       res.json(tags.map(t => t.name));
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: '获取标签失败' });
//     }
//   }
// );
exports.default = router;
