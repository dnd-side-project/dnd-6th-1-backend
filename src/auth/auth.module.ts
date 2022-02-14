import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // screte 토큰을 만들때 이용하는 Secret 텍스트
      secret: 'Secret1234',
      signOptions: {
        // 1시간 이후에는 이 토큰이 더 이상 유효x
        expiresIn: 60 * 60,
      }
    }),
    TypeOrmModule.forFeature([
      AuthRepository,
      UsersRepository
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule {}
