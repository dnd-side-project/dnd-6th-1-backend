import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
require("dotenv").config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // screte 토큰을 만들때 이용하는 Secret 텍스트
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: "20d"
      }
    }),
    TypeOrmModule.forFeature([
      AuthRepository,
      UsersRepository
    ]),
    // 이메일 전송
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        // SMTP : 인터넷에서 메일을 주고 받기 위한 전송 규약 및 프로토콜
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
        template: {
          dir: process.cwd() + '/template/',
          adaptor: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule {}
