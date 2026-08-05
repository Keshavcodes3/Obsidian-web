import { Router } from "express";
import userController from "../controllers/user.controller";



const userRouter = Router();


userRouter.post(
    "/register",
    userController.register
);

userRouter.post("/login", userController.login);

userRouter.post("/verify-email", userController.verifyEmail);


export default userRouter;