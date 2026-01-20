import { UserDto } from '@cdm/models';
import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserSignInBody } from './objects/body/user-sign-in.body';
import { UserSignUpBody } from './objects/body/user-sign-up.body';
import { JwtTokensDto } from './objects/dto/jwt-tokens.dto';
import { SetRefreshTokenDto } from './objects/dto/set-refresh-token.dto';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    ) { }

    async signUp(body: UserSignUpBody): Promise<UserDto> {
        const user: UserDto = await this.fetchOneUserByEmail(body.email)

        if (!user) {
            const createdUser: UserDto = await this.createUser(body)

            if (createdUser) {
                const userWithTokens = await this.setTokens(createdUser)
                return userWithTokens
            } else {
                throw new BadRequestException('Fail to create')
            }
        } else {
            throw new BadRequestException('User already exist')
        }
    }

    async signIn(body: UserSignInBody) {
        const user: UserDto = await firstValueFrom(
            this.userClient.send({ cmd: 'user.findOneByEmail' }, { email: body.email })
        );

        if (user) {
            const userWithTokens = await this.setTokens(user)
            return userWithTokens
        } else {
            throw new BadRequestException('Issue with sign in');
        }
    }

    async refreshToken(token: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(token);

            if (!decoded?.sub) {
                throw new ForbiddenException("Invalid token");
            }

            const user = await this.fetchOneUserById(decoded.sub);

            if (!user || user.refreshToken !== token) {
                throw new ForbiddenException("Access denied");
            }

            return await this.setTokens(user);
        } catch (e) {
            throw new ForbiddenException("Invalid refresh token");
        }
    }

    // MARK - Utils TCP
    async fetchOneUserById(id: number): Promise<UserDto> {
        return await firstValueFrom(
            this.userClient.send({ cmd: 'user.findOneById' }, { id: id })
        );
    }

    async fetchOneUserByEmail(email: string): Promise<UserDto> {
        return await firstValueFrom(
            this.userClient.send({ cmd: 'user.findOneByEmail' }, { email: email })
        );
    }

    async createUser(body: UserSignInBody): Promise<UserDto> {
        return await firstValueFrom(
            this.userClient.send({ cmd: 'user.create' }, body)
        );
    }

    async setRefreshToken(refreshTokenDto: SetRefreshTokenDto): Promise<UserDto> {
        return await firstValueFrom(
            this.userClient.send({ cmd: 'user.setRefreshToken' }, refreshTokenDto)
        );
    }

    // MARK - Utils
    async setTokens(user: UserDto): Promise<UserDto> {
        if (user.id) {
            const tokens = await this.generateTokenAndRefreshToken(user)
            const dto = new SetRefreshTokenDto(user.id, tokens.refreshToken)
            const updatedUser: UserDto = await this.setRefreshToken(dto)
            updatedUser.accessToken = tokens.accessToken
            return updatedUser
        } else {
            throw new BadRequestException('No user id')
        }
    }

    async generateTokenAndRefreshToken(user: UserDto): Promise<JwtTokensDto> {
        const payload = { sub: user.id };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: "1h"
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: "30d"
        });

        return new JwtTokensDto(accessToken, refreshToken)
    }

    generateUserWithToken(user: UserDto, tokens: { accessToken: string, refreshToken: string }): UserDto {
        const userResponse = user
        userResponse.accessToken = tokens.accessToken
        userResponse.refreshToken = tokens.refreshToken

        return userResponse;
    }
}
