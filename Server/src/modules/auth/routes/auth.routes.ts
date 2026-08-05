import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validate } from "@/common/middlewares/validate.middleware";
import { loginSchema, verifyEmailSchema } from "@/modules/users/validators/user.validators";

const authRouter = Router();

authRouter.post(
    "/login",
    validate({ body: loginSchema }),
    authController.login
);

authRouter.post(
    "/verify-email",
    validate({ body: verifyEmailSchema }),
    authController.verifyEmail
);

authRouter.post("/refresh", authController.refreshSession);

authRouter.post("/logout", authController.logout);

export default authRouter;
