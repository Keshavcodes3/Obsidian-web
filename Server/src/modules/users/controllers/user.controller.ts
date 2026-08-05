import { Request, Response } from "express";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";

import UserService from "../services/user.service";
import userRepo from "../repositories/user.repo";


class UserController {

    private userService: typeof UserService;


    constructor() {
        this.userService = UserService;
    }


    register = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const user =
                await this.userService.registerUserService(
                    req.body
                );


            return res.status(201).json(new ApiSuccess({
                message: "User created successfully",
                data: {
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                    profile: user.profile
                }
            }))
        }
    );


    login = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.loginService(req.body);

        return res.status(200).json(new ApiSuccess({
            message: "User logged in successfully",
            data: {
                userId: user._id,
                email: user.email,
                username: user.username,
                profile: user.profile
            }
        }))
    });

    verifyEmail = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.userService.verifyEmailService(req.body);

        return res.status(200).json(
            new ApiSuccess({
                message: "Email verified successfully",
                data: result,
            })
        )
    })
}


export default new UserController();