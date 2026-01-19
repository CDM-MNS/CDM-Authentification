import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpBody } from './objects/body/user-sign-up.body';

@Controller('auth')
export class AppController {
    constructor(private readonly authService: AuthService) { }

    @Get('/')
    async home() {
        return "I'm in auth"
    }

    @Post('signUp')
    async signUp(@Body() body: UserSignUpBody) {
        return this.authService.signUp(body)
    }

}
