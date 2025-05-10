import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthController } from './controllers/auth.controller';
import { SessionController } from './controllers/session.controller';
import { SessionService } from './services/session.service';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { OtpService } from './services/otp.service';
import { LoginUserUseCase } from '@/identity/auth/use-cases/login-user.use-case';
import { UserModule } from '@/identity/user/user.module';
import { OtpTokenRepository } from '@/identity/auth/repositories/otp-token.repository';
import {
  RequestPasswordResetOtpUseCase,
  ResetPasswordUseCase,
  RegisterUserUseCase,
} from '@/identity/auth/use-cases';

const USE_CASES = [
  LoginUserUseCase,
  RegisterUserUseCase,
  RequestPasswordResetOtpUseCase,
  ResetPasswordUseCase,
];
const REPOSITORIES = [OtpTokenRepository];

@Module({
  imports: [UserModule],
  controllers: [AuthController, SessionController, ResetPasswordController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ...USE_CASES,
    ...REPOSITORIES,
    SessionService,
    OtpService,
  ],
})
export class AuthModule {}
