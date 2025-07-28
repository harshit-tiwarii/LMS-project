import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import dbToConnect from './config/db.js'
import { route } from './routers/authRoute.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';
const app = express()

dbToConnect();
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))


app.use('/',route)

app.use(errorMiddleware)

export default app