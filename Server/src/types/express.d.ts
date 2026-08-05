import { UserRole } from "@/modules/auth/enums/user-role.enum";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
                email: string;
            };
        }
    }
}
