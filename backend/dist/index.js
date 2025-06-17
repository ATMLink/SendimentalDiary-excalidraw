"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const diaries_1 = __importDefault(require("./routes/diaries"));
const tags_1 = __importDefault(require("./routes/tags"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
// // 静态文件服务
// app.use('/uploads', (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.setHeader('Access-Control-Allow-Methods', 'GET');
//   express.static(path.join(__dirname, '../uploads'))(req, res, next);
// });
// 静态文件服务
app.use('/uploads', (0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET'],
}), (req, res, next) => {
    // console.log(`Serving file: ${req.url}`); // 调试图片请求
    const filePath = path_1.default.join(__dirname, '../uploads');
    express_1.default.static(filePath)(req, res, () => {
        // 处理文件不存在的情况
        if (!res.headersSent) {
            res.status(404).json({ error: `File not found: ${req.url}` });
        }
    });
});
mongoose_1.default.connect('mongodb://localhost:27017/zeldaDiary')
    .then(() => console.log('MongoDB connected'))
    .catch(console.error);
app.use('/api/auth', auth_1.default);
app.use('/api/diaries', diaries_1.default);
app.use('/api/tags', tags_1.default);
// ... 其他路由
app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
