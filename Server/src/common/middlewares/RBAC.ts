import type { NextFunction, Request, Response } from "express";

import { ApiError } from "@/common/utils/apiError";
import { UserRole } from "@/modules/auth/enums/user-role.enum";

export const authorize =
    (...allowedRoles: UserRole[]) =>
        (
            req: Request,
            _res: Response,
            next: NextFunction
        ) => {

            const user = req.user;

            if (!user) {
                return next(
                    new ApiError({
                        statusCode: 401,
                        message: "Authentication required",
                    })
                );
            }
            //@ts-ignore
            if (!allowedRoles.includes(user.role)) {
                return next(
                    new ApiError({
                        statusCode: 403,
                        message: "You don't have permission to perform this action",
                    })
                );
            }

            next();
        };