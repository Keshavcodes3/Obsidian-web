import express from 'express'
import { envConfig } from './config/env'
import morgan from 'morgan'

const app = express()

app.use(express.json())
app.use(morgan("dev"))

import "./modules/email/email.listener"


import userRouter from './modules/users/routes/user.routes'

console.log(envConfig.REDIS_PORT)

app.use(`${envConfig.API_PREFIX}/auth`, userRouter)

export default app