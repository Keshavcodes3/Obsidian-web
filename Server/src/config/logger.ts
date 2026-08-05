import pino from "pino";
import { envConfig } from "@/config/env.js";


export const logger = pino({
    level: envConfig.LOG_LEVEL ?? "info",

    base: {
        app: envConfig.APP_NAME ?? "Lattice",
        environment: envConfig.NODE_ENV ?? "development",
    },

    timestamp: pino.stdTimeFunctions.isoTime,
});