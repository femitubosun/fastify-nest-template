import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SessionController } from './controllers/session.controller';
import { SessionService } from './services/session.service';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { OtpService } from './services/otp.service';

@Module({
  imports: [],
  controllers: [AuthController, SessionController, ResetPasswordController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    SessionService,
    OtpService,
  ],
})
export class AuthModule {}
