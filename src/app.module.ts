import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: process.env.USER_SERVICE_HOST || '',
                    port: parseInt(process.env.USER_SERVICE_TCP_PORT || ''),
                },
            }
        ]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET
        }),
    ],
    controllers: [AppController],
    providers: [AuthService],
})
export class AppModule { }
