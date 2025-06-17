"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/tags.ts
const express_1 = __importDefault(require("express"));
const Tag_1 = __importDefault(require("../models/Tag"));
const router = express_1.default.Router();
// GET /api/tags - 获取所有不重复的标签名
router.get('/', async (_req, res) => {
    try {
        const tags = await Tag_1.default.find({}, 'name').sort({ name: 1 });
        // 直接返回字符串数组
        res.json(tags.map(t => t.name));
    }
    catch (error) {
        console.error('获取标签失败:', error);
        res.status(500).json({ message: '获取标签失败' });
    }
});
exports.default = router;
