import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInBody } from './objects/body/user-sign-in.body';
import { UserSignUpBody } from './objects/body/user-sign-up.body';

@Controller('auth')
export class AppController {
    constructor(private readonly authService: AuthService) { }

    @Post('signUp')
    async signUp(@Body() body: UserSignUpBody) {
        return this.authService.signUp(body)
    }

    @Post('signIn')
    async signIn(@Body() body: UserSignInBody) {
        return this.authService.signIn(body)
    }

    @Get('refreshToken/:refreshToken')
    async refreshToken(@Param('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken)
    }

}
