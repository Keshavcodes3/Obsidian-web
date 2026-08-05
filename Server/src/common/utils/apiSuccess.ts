export class ApiSuccess<T = unknown> {
    public readonly success: boolean;
    public readonly message: string;
    public readonly data: T;
    public readonly meta?: unknown;

    constructor({
        message,
        data,
        meta,
    }: {
        message: string;
        data: T;
        meta?: unknown;
    }) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.meta = meta;
    }
}