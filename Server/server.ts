import 'dotenv/config'

import app from "@/app";
import { connectToDb } from "@/config/database";
import { envConfig } from "@/config/env";
import redis from '@/config/redis';

connectToDb()
redis
app.listen(envConfig.PORT, () => {
    console.log(`server is listening at port ${envConfig.PORT}`)
})