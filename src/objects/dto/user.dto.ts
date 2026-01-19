import { UserRoleType } from "../enums/user-role.enum";

export class UserDto {

    id: number | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    role: UserRoleType | undefined;
    accessToken: string | undefined;
    refreshToken: string | undefined;
    createdAt: Date | undefined;
    
}