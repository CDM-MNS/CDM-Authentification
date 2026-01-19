import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator";
import { UserRoleType } from "../enums/user-role.enum";

export class UserSignUpBody {

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(10)
  password: string;

  @IsNotEmpty()
  refreshToken: string;

  @IsEnum(UserRoleType)
  role: UserRoleType;
  
}