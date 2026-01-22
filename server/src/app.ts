import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/post.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server connected',
  })
})

app.use('/api', authRoutes)
app.use('/api', postRoutes)

export default app