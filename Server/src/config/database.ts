import mongoose from "mongoose";
import { envConfig } from "@/config/env.js";


export const connectToDb = async (): Promise<void> => {
    try {

        mongoose.connection.on(
            "connected",
            () => {
                console.log("MongoDB connected");
            }
        );


        mongoose.connection.on(
            "error",
            (error) => {
                console.error(
                    "MongoDB error:",
                    error
                );
            }
        );


        mongoose.connection.on(
            "disconnected",
            () => {
                console.warn(
                    "MongoDB disconnected"
                );
            }
        );


        await mongoose.connect(
            envConfig.MONGODB_URI,
            {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
            }
        );

    } catch (error) {

        console.error(
            "Database initialization failed",
            error
        );

        process.exit(1);

    }
};