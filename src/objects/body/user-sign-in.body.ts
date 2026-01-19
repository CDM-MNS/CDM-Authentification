import { IsEmail, IsNotEmpty } from "class-validator";

export class UserSignInBody {

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

}