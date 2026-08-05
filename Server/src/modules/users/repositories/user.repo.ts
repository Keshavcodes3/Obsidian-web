import UserModel from "../models/user.model";
import { UserInterface } from "../types/user.types";


class UserRepository {

    async create(
        data: Partial<UserInterface>
    ) {
        return UserModel.create(data);
    }


    async findByEmail(
        email: string
    ) {
        return UserModel.findOne({
            email,
        });
    }


    async findByUsername(
        username: string
    ) {
        return UserModel.findOne({
            username,
        });
    }


    async findById(
        userId: string
    ) {
        return UserModel.findById(userId);
    }


    async existsByEmail(
        email: string
    ) {
        return UserModel.exists({
            email,
        });
    }


    async updateById(
        userId: string,
        data: Partial<UserInterface>
    ) {
        return UserModel.findByIdAndUpdate(
            userId,
            data,
            {
                new: true,
            }
        );
    }


    async deleteById(
        userId: string
    ) {
        return UserModel.findByIdAndDelete(userId);
    }
}


export default new UserRepository();