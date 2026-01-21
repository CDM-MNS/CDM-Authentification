import { UserRoleType } from "cdm-models";
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator";

export class UserSignUpBody {

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(10)
  password: string;

  @IsEnum(UserRoleType)
  role: UserRoleType;
  
}