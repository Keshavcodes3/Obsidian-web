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
import "./common/Listener/vault.listener"




import userRouter from './modules/users/routes/user.routes'
import authRouter from './modules/auth/routes/auth.routes'
import workspaceRouter from './modules/Workspace/routes/workspace.routes'
import vaultRouter from './modules/vault/routes/vault.routes'
import memberRouter from './modules/Members/routes/member.routes'
import invitationRouter from './modules/Invitations/Routes/invitation.routes'
import noteRouter from './modules/Notes/routes/note.routes'
import blockRouter from './modules/Block/routes/block.routes'
import attachmentrouter from "@/modules/Attachment/Routes/attachment.route"
import healthRouter from './routes/health.route'

app.use(`${envConfig.API_PREFIX}/users`, userRouter)
app.use(`${envConfig.API_PREFIX}/auth`, authRouter)
app.use(`${envConfig.API_PREFIX}/workspace`, workspaceRouter)
app.use(`${envConfig.API_PREFIX}/vault`, vaultRouter)
app.use(`${envConfig.API_PREFIX}/notes`, noteRouter)
app.use(`${envConfig.API_PREFIX}/blocks`, blockRouter)
app.use(`${envConfig.API_PREFIX}`, memberRouter)
app.use(`${envConfig.API_PREFIX}`, invitationRouter)
app.use(`${envConfig.API_PREFIX}/attachments`, attachmentrouter)
app.use('/', healthRouter)


app.use(errorHandler)

export default app