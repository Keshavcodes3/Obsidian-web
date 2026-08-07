import { v4 as uuid } from "uuid";

export const generateInviteCode = (): string => {
    return uuid();
};