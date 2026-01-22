import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import postRoutes from './routes/post'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', postRoutes)

export default app