// // backend/src/index.ts
// import express from 'express'
// import cors from 'cors'
// import path from 'path'
// import mongoose from 'mongoose'
// import authRouter from './routes/auth'
// import diariesRouter from './routes/diaries'
// import tagsRoutes from './routes/tags'
// import wishesRouter from './routes/wishes'
// import moodsRouter from './routes/moods';

// const app = express()
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }))
// app.use(express.json({ limit: '110mb' }));
// app.use(express.urlencoded({ extended: true, limit: '110mb' }));

// // app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
// // // 静态文件服务
// // app.use('/uploads', (req, res, next) => {
// //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
// //   res.setHeader('Access-Control-Allow-Methods', 'GET');
// //   express.static(path.join(__dirname, '../uploads'))(req, res, next);
// // });
// // 静态文件服务
// app.use('/uploads', cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET'],
// }), (req, res, next) => {
//   // console.log(`Serving file: ${req.url}`); // 调试图片请求
//   const filePath = path.join(__dirname, '../uploads');
//   express.static(filePath)(req, res, () => {
//     // 处理文件不存在的情况
//     if (!res.headersSent) {
//       res.status(404).json({ error: `File not found: ${req.url}` });
//     }
//   });
// });

// mongoose.connect('mongodb://localhost:27017/zeldaDiary')
//   .then(() => console.log('MongoDB connected'))
//   .catch(console.error)

// app.get('/', (req, res) => {
//   res.send('心情日记后端服务正在运行...');
// });

// app.use('/api/auth', authRouter)
// app.use('/api/diaries', diariesRouter)
// app.use('/api/tags', tagsRoutes)
// app.use('/api/wishes', wishesRouter)
// app.use('/api/moods', moodsRouter);
// // ... 其他路由

// app.listen(3000, () => {
//   console.log('Server listening on http://localhost:3000')
// })
// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import diariesRouter from './routes/diaries';
import tagsRoutes from './routes/tags';
import wishesRouter from './routes/wishes';
import moodsRouter from './routes/moods';

const app = express();

// --- 核心修改 1: 配置 CORS ---
// 允许来自你 Vercel 前端域名和本地开发环境的请求
// 请将 'YOUR_FRONTEND_URL' 替换为你的 Vercel 前端项目的实际域名
const allowedOrigins = [
  'http://localhost:5173', 
  'https://YOUR_FRONTEND_URL.vercel.app' // 例如: 'https://diary-app.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // 允许没有来源的请求 (比如 Postman) 或在白名单内的请求
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- 核心修改 2: 使用环境变量连接数据库 ---
// 从 Vercel 的环境变量中读取 MONGO_URI
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('错误: MONGO_URI 环境变量未设置!');
  process.exit(1); // 如果没有数据库连接字符串，则阻止应用启动
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Atlas connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- 核心修改 3: 保持标准的中间件和路由 ---
app.use(express.json({ limit: '25mb' })); // 保持一个合理的请求大小限制
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 为根路径添加一个简单的欢迎信息
app.get('/', (req, res) => {
  res.send('心情日记后端服务正在运行...');
});

// 挂载所有 API 路由
app.use('/api/auth', authRouter);
app.use('/api/diaries', diariesRouter);
app.use('/api/tags', tagsRoutes);
app.use('/api/wishes', wishesRouter);
app.use('/api/moods', moodsRouter);

// --- 核心修改 4: 移除 app.listen，导出 app ---
// 在 Vercel 的无服务器环境中，我们导出 app 实例，由 Vercel 负责监听
export default app;