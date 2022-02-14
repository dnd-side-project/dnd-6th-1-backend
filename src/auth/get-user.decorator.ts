import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Users } from "./users.entity";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): Users => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
    // ctx.switchToHttp().getRequest() 안에 Request의 전체 객체가 들어있고,
    // 그 중 user의 정보만 사용할 것이므로 req.user만 반환
})