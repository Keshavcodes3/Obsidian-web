import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/apiError";

/**
 * Validation Middleware using Zod.
 * 
 * WHY THIS EXISTS:
 * Controllers should not be burdened with checking if 'email' is a valid format
 * or if 'password' is long enough. The validation middleware intercepts the request
 * and strictly parses req.body, req.query, or req.params against a Zod schema.
 * 
 * HOW IT WORKS:
 * 1. Takes a Zod schema for body, query, and/or params.
 * 2. Runs schema.safeParse() on the request parts.
 * 3. If validation fails, it extracts a flattened dictionary of field-specific errors
 *    and throws an ApiError, which the global error handler then formats.
 * 4. If validation succeeds, it mutates the request with the validated (and potentially 
 *    coerced/stripped) data, ensuring controllers only ever deal with strictly typed data.
 */
export const validate = (schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                const result = schemas.body.safeParse(req.body);
                if (!result.success) {
                    throwValidationApiError(result.error);
                }
                req.body = result.data; // Use the sanitized/typed data
            }

            if (schemas.query) {
                const result = schemas.query.safeParse(req.query);
                if (!result.success) {
                    throwValidationApiError(result.error);
                }
                //@ts-ignore
                req.query = result.data;
            }

            if (schemas.params) {
                const result = schemas.params.safeParse(req.params);
                if (!result.success) {
                    throwValidationApiError(result.error);
                }
                //@ts-ignore
                req.params = result.data;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

function throwValidationApiError(zodError: ZodError) {
    const formattedErrors = zodError.flatten().fieldErrors;

    // We construct a flat object map for the client: { "email": "Invalid email", "password": "Too short" }
    const errors: Record<string, string> = {};
    //@ts-ignore
    for (const [key, messages] of Object.entries(formattedErrors)) {
        //@ts-ignore
        if (messages && messages.length > 0) {
            errors[key] = messages[0];
        }
    }

    throw new ApiError({
        statusCode: 400,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        errors
    });
}
