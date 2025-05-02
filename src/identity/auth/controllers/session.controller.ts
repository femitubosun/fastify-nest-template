import { AuthedRequest } from '@common/__defs__';
import { Controller, Get, Req } from '@nestjs/common';

@Controller('auth/session')
export class SessionController {
  @Get()
  getSessionUser(@Req() req: AuthedRequest) {
    return req.user;
  }
}
