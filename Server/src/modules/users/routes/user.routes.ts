import { Router } from "express";
import userController from "../controllers/user.controller";



const userRouter = Router();


userRouter.post(
    "/register",
    userController.register
);


export default userRouter;