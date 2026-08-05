export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly errors?: unknown;
    public readonly isOperational: boolean;

    constructor({
        statusCode,
        message,
        errorCode = "UNKNOWN_ERROR",
        errors,
        isOperational = true,
    }: {
        statusCode: number;
        message: string;
        errorCode?: string;
        errors?: unknown;
        isOperational?: boolean;
    }) {
        super(message);

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errors = errors;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}