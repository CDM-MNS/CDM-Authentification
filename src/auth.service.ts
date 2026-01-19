import { UserDto } from '@cdm/models';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
                console.log('Fail to create')
                throw new BadRequestException('Fail to create')
            }
        } else {
            console.log('already exist')
            throw new BadRequestException('User already exist')
        }
    }

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

    async signIn(body: UserSignInBody) {
        const user: UserDto = await firstValueFrom(
            this.userClient.send({ cmd: 'user.findOne' }, { email: body.email })
        );

        console.log("User : ", user)

        /*
        if (user) {
            const tokens = await this.generateTokenAndRefreshToken(user)

            await this.repository.update(userSaved.id, {
                refreshToken: await argon2.hash(tokens.refreshToken),
            });

            return this.generateUserWithToken(user, tokens)
        } else {
            throw new BadRequestException('Issue with sign in');
        }
            */
    }

    // MARK - Utils TCP
    async fetchOneUserByEmail(email: string): Promise<UserDto> {
        return await firstValueFrom(
            this.userClient.send({ cmd: 'user.findOne' }, { email: email })
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
    async generateTokenAndRefreshToken(user: UserDto): Promise<JwtTokensDto> {
        const payload = { sub: user.id, email: user.email };

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
