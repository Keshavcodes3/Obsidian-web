import { envConfig } from "./env";

import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export default redis;

export const bullConnection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
};