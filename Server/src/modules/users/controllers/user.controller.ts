import { Request, Response } from "express";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";

import UserService from "../services/user.service";


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

}


export default new UserController();