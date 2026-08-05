import { Types } from "mongoose";
import SessionModel, { ISession } from "../models/auth.model";

/**
 * Session Repository.
 * 
 * WHY THIS EXISTS:
 * Encapsulates all database operations for user sessions. The service layer
 * shouldn't know we are using Mongoose or MongoDB. If we switch to PostgreSQL
 * or Redis for session storage later, only this file changes.
 */
class SessionRepository {
    async create(data: Partial<ISession>) {
        return SessionModel.create(data);
    }

    async findById(sessionId: string) {
        return SessionModel.findById(sessionId);
    }

    async findByUserId(userId: string | Types.ObjectId) {
        return SessionModel.find({ userId });
    }

    async findByRefreshTokenHash(refreshTokenHash: string) {
        return SessionModel.findOne({ refreshTokenHash });
    }

    async updateById(sessionId: string, data: Partial<ISession>) {
        return SessionModel.findByIdAndUpdate(sessionId, data, { new: true });
    }

    async revokeSession(sessionId: string) {
        return SessionModel.findByIdAndUpdate(
            sessionId,
            { revokedAt: new Date() },
            { new: true }
        );
    }

    async revokeAllUserSessions(userId: string | Types.ObjectId) {
        return SessionModel.updateMany(
            { userId, revokedAt: null },
            { revokedAt: new Date() }
        );
    }

    async deleteById(sessionId: string) {
        return SessionModel.findByIdAndDelete(sessionId);
    }
}

export default new SessionRepository();
