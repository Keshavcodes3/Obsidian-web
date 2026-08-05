import { UserRole } from "@/modules/auth/enums/user-role.enum";

export type RegisterDto={
    username:string,
    role:UserRole,
    email:string,
    password:string,
}