import { Injectable } from '@nestjs/common';
import { UserSignInBody } from './objects/body/user-sign-in.body';

@Injectable()
export class AuthService {
  
    async signIn(body: UserSignInBody) {
        
    }

}
