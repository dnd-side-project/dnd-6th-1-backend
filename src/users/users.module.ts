import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';



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
    TypeOrmModule.forFeature([UsersRepository])
  ],
  controllers: [UserController],
  providers: [UsersService, JwtStrategy],
  exports: [JwtStrategy, PassportModule]
})
export class UserModule {}
