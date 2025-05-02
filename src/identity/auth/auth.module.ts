import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SessionController } from './controllers/session.controller';
import { SessionService } from './services/session.service';

@Module({
  imports: [],
  controllers: [AuthController, SessionController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    SessionService,
  ],
})
export class AuthModule {}
