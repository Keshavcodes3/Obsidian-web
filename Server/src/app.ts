import express from 'express'
import { envConfig } from './config/env'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { securityMiddleware } from './config/security'
import { errorHandler } from './common/middlewares/error.middleware'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(securityMiddleware)


//?Listener
import "./common/Listener/workspace.listener"
import "./common/Listener/email.listener"


import userRouter from './modules/users/routes/user.routes'
import authRouter from './modules/auth/routes/auth.routes'
import workspaceRouter from './modules/Workspace/routes/workspace.routes'
import vaultRouter from './modules/vault/routes/vault.routes'

app.use(`${envConfig.API_PREFIX}/users`, userRouter)
app.use(`${envConfig.API_PREFIX}/auth`, authRouter)
app.use(`${envConfig.API_PREFIX}/workspace`, workspaceRouter)
app.use(`${envConfig.API_PREFIX}/vault`, vaultRouter)

app.use(errorHandler)

export default app