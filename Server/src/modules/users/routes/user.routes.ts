import { Router } from "express";
import userController from "../controllers/user.controller";
import { validate } from "@/common/middlewares/validate.middleware";
import { requireAuth } from "@/common/middlewares/auth.middleware";
import { registerSchema } from "../validators/user.validators";

const userRouter = Router();

userRouter.post(
    "/register",
    validate({ body: registerSchema }),
    userController.register
);

userRouter.get(
    "/me",
    requireAuth,
    userController.getMe
);

export default userRouter;