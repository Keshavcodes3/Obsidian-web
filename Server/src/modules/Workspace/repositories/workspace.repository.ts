import { WorkspaceModel } from "../models/workspace.model";
import { WorkspaceInterface } from "../types/workspace.types";
import { Types } from "mongoose";
class WorkspaceRepository {

    async create(
        data: Partial<WorkspaceInterface>
    ) {
        return WorkspaceModel.create(data);
    }

    async findById(
        workspaceId: Types.ObjectId
    ) {
        return WorkspaceModel.findById(workspaceId);
    }

    async findBySlug(
        slug: string
    ) {
        return WorkspaceModel.findOne({ slug });
    }

    async findByOwner(
        ownerId: string
    ) {
        return WorkspaceModel.find({
            ownerId,
        });
    }

    async findByMember(
        userId: string
    ) {
        return WorkspaceModel.find({
            "members.userId": userId,
        });
    }

    async updateById(
        workspaceId: string,
        data: Partial<WorkspaceInterface>
    ) {
        return WorkspaceModel.findByIdAndUpdate(
            workspaceId,
            data,
            {
                new: true,
            }
        );
    }

    async deleteById(
        workspaceId: string
    ) {
        return WorkspaceModel.findByIdAndDelete(
            workspaceId
        );
    }

}

export default new WorkspaceRepository();