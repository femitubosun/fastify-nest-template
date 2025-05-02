import { AuthedRequest } from '@common/__defs__';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { SessionUserDto } from '../__defs__';

@Controller('auth/session')
export class SessionController {
  @Get()
  @ApiOkResponse({
    type: SessionUserDto,
  })
  getSessionUser(@Req() req: AuthedRequest) {
    return req.user;
  }
}
