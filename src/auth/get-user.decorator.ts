import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Users } from "./users.entity";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): Users => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
})