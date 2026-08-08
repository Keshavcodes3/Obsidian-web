import { Types, isValidObjectId } from "mongoose";
import { ApiError } from "./apiError";

export const validateObjectId = (id: string, name: string) => {
    if (!id || !isValidObjectId(id)) {
        throw new ApiError({
            statusCode: 400,
            message: `Invalid ${name} ID`,
        });
    }
};
