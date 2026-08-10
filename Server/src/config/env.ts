type Config = {
    readonly NODE_ENV: "development" | "production" | "test";


    readonly PORT: number;
    readonly APP_NAME: string;
    readonly APP_URL: string;
    readonly CLIENT_URL: string;
    readonly API_PREFIX: string;

    readonly MONGODB_URI: string;

    readonly RESEND_API_KEY: string;

    readonly REDIS_HOST: string;
    readonly REDIS_PORT: number;
    readonly REDIS_USERNAME: string;
    readonly REDIS_PASSWORD: string;

    readonly JWT_ACCESS_SECRET: string;
    readonly JWT_REFRESH_SECRET: string;
    readonly JWT_ACCESS_EXPIRES_IN: string;
    readonly JWT_REFRESH_EXPIRES_IN: string;

    // Cookie
    readonly COOKIE_SECRET: string;
    readonly COOKIE_DOMAIN: string;
    readonly COOKIE_SECURE: boolean;
    readonly COOKIE_SAME_SITE: "strict" | "lax" | "none";


    readonly BCRYPT_SALT_ROUNDS: number;

    readonly SMTP_HOST: string;
    readonly SMTP_PORT: number;
    readonly SMTP_SECURE: boolean;
    readonly SMTP_USER: string;
    readonly SMTP_PASSWORD: string;
    readonly EMAIL_FROM: string;
    readonly EMAIL_NAME: string;


    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly CLOUDINARY_API_KEY: string;
    readonly CLOUDINARY_API_SECRET: string;


    readonly AWS_ACCESS_KEY_ID: string;
    readonly AWS_SECRET_ACCESS_KEY: string;
    readonly AWS_REGION: string;
    readonly AWS_BUCKET_NAME: string;


    readonly SEARCH_PROVIDER: string;
    readonly MEILI_HOST: string;
    readonly MEILI_MASTER_KEY: string;
    readonly ELASTICSEARCH_NODE: string;
    readonly ELASTICSEARCH_USERNAME: string;
    readonly ELASTICSEARCH_PASSWORD: string;

    readonly QUEUE_PREFIX: string;


    readonly RATE_LIMIT_WINDOW_MS: number;
    readonly RATE_LIMIT_MAX_REQUESTS: number;


    readonly LOG_LEVEL: string;

    readonly CORS_ORIGIN: string;
    readonly WS_CORS_ORIGIN: string;


    readonly ENABLE_AI: boolean;
    readonly ENABLE_COLLABORATION: boolean;
    readonly ENABLE_ANALYTICS: boolean;
    readonly ENABLE_SIGNUP: boolean;

    readonly GROQ_API_KEY: string;
    readonly MISTRAL_API_KEY: string;
    readonly GOOGLE_AI_API_KEY: string;


    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;
    readonly GITHUB_CLIENT_ID: string;
    readonly GITHUB_CLIENT_SECRET: string;

    readonly SENTRY_DSN: string;


    readonly POSTHOG_API_KEY: string;
    readonly POSTHOG_HOST: string;


    readonly DAILY_NOTE_CRON: string;

    // Encryption
    readonly ENCRYPTION_KEY: string;

    // API
    readonly API_KEY_LENGTH: number;

    // Cache
    readonly CACHE_TTL: number;

    // Upload
    readonly MAX_FILE_SIZE: number;
    readonly MAX_IMAGE_SIZE: number;

    // Pagination
    readonly DEFAULT_PAGE_SIZE: number;
    readonly MAX_PAGE_SIZE: number;

    // Graph
    readonly GRAPH_MAX_NODES: number;
    readonly GRAPH_MAX_EDGES: number;

    // Markdown
    readonly MARKDOWN_MAX_SIZE: number;

    // Versioning
    readonly MAX_NOTE_REVISIONS: number;

    // Proxy
    readonly TRUST_PROXY: boolean;

    //IMAGEKIT
    readonly IMAGEKIT_ENDPOINT:string;
    readonly IMAGEKIT_PUBLIC_KEY:string;
    readonly IMAGEKIT_PRIVATE_KEY:string
};

export const envConfig: Config = {
    NODE_ENV: process.env.NODE_ENV as Config["NODE_ENV"],
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    PORT: Number(process.env.PORT),
    APP_NAME: process.env.APP_NAME!,
    APP_URL: process.env.APP_URL!,
    CLIENT_URL: process.env.CLIENT_URL!,
    API_PREFIX: process.env.API_PREFIX!,

    MONGODB_URI: process.env.MONGODB_URI!,

    REDIS_HOST: process.env.REDIS_HOST!,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_USERNAME: process.env.REDIS_USERNAME ?? "",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? "",

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,

    COOKIE_SECRET: process.env.COOKIE_SECRET!,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN!,
    COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
    COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE as Config["COOKIE_SAME_SITE"],

    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),

    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_SECURE: process.env.SMTP_SECURE === "true",
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
    EMAIL_FROM: process.env.EMAIL_FROM!,
    EMAIL_NAME: process.env.EMAIL_NAME!,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    AWS_REGION: process.env.AWS_REGION!,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME!,

    SEARCH_PROVIDER: process.env.SEARCH_PROVIDER!,
    MEILI_HOST: process.env.MEILI_HOST!,
    MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY!,
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE!,
    ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME!,
    ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD!,

    QUEUE_PREFIX: process.env.QUEUE_PREFIX!,

    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS),
    RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS),

    LOG_LEVEL: process.env.LOG_LEVEL!,

    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    WS_CORS_ORIGIN: process.env.WS_CORS_ORIGIN!,

    ENABLE_AI: process.env.ENABLE_AI === "true",
    ENABLE_COLLABORATION: process.env.ENABLE_COLLABORATION === "true",
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === "true",
    ENABLE_SIGNUP: process.env.ENABLE_SIGNUP === "true",

    GROQ_API_KEY: process.env.OPENAI_API_KEY ?? "",
    MISTRAL_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ?? "",

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",

    SENTRY_DSN: process.env.SENTRY_DSN ?? "",

    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY ?? "",
    POSTHOG_HOST: process.env.POSTHOG_HOST ?? "",

    DAILY_NOTE_CRON: process.env.DAILY_NOTE_CRON!,

    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,

    API_KEY_LENGTH: Number(process.env.API_KEY_LENGTH),

    CACHE_TTL: Number(process.env.CACHE_TTL),

    MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE),
    MAX_IMAGE_SIZE: Number(process.env.MAX_IMAGE_SIZE),

    DEFAULT_PAGE_SIZE: Number(process.env.DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE: Number(process.env.MAX_PAGE_SIZE),

    GRAPH_MAX_NODES: Number(process.env.GRAPH_MAX_NODES),
    GRAPH_MAX_EDGES: Number(process.env.GRAPH_MAX_EDGES),

    MARKDOWN_MAX_SIZE: Number(process.env.MARKDOWN_MAX_SIZE),

    MAX_NOTE_REVISIONS: Number(process.env.MAX_NOTE_REVISIONS),

    TRUST_PROXY: process.env.TRUST_PROXY === "true",

    IMAGEKIT_ENDPOINT:process.env.IMAGEKIT_ENDPOINT!,

    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY!,

    IMAGEKIT_PUBLIC_KEY:process.env.IMAGEKIT_PUBLIC_KEY!
};