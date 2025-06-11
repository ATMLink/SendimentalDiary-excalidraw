// backend/src/index.ts
import express from 'express'
import cors from 'cors'
import path from 'path'
import mongoose from 'mongoose'
import authRouter from './routes/auth'
import diariesRouter from './routes/diaries'

const app = express()
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({limit: '10mb'}))

// app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
// // 静态文件服务
// app.use('/uploads', (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.setHeader('Access-Control-Allow-Methods', 'GET');
//   express.static(path.join(__dirname, '../uploads'))(req, res, next);
// });
// 静态文件服务
app.use('/uploads', cors({
  origin: 'http://localhost:5173',
  methods: ['GET'],
}), (req, res, next) => {
  console.log(`Serving file: ${req.url}`); // 调试图片请求
  const filePath = path.join(__dirname, '../uploads');
  express.static(filePath)(req, res, () => {
    // 处理文件不存在的情况
    if (!res.headersSent) {
      res.status(404).json({ error: `File not found: ${req.url}` });
    }
  });
});

mongoose.connect('mongodb://localhost:27017/zeldaDiary')
  .then(() => console.log('MongoDB connected'))
  .catch(console.error)

app.use('/api/auth', authRouter)
app.use('/api/diaries', diariesRouter)
// ... 其他路由

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})
