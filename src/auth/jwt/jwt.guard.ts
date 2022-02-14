import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){}
// AuthGuard를 상속받았는데, AuthGuard는 Jwt Strategy를 자동으로 실행해주는 기능이 있습니다.