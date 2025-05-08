// backend/src/index.ts
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRouter from './routes/auth'
// import diariesRouter from './routes/diaries'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/zeldaDiary')
  .then(() => console.log('MongoDB connected'))
  .catch(console.error)

app.use('/api/auth', authRouter)
// app.use('/api/diaries', diariesRouter)
// ... 其他路由

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})
