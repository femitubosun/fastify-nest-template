import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  RequestPasswordResetTokenDto,
  RequestPasswordResetTokenResponseDto,
  ResetPasswordDto,
} from '../__defs__/password.dto';

import { MessageResponseDto } from 'src/common/__defs__';
import { Public } from '../decorators/public.decorator';
import { RequestPasswordResetOtpUseCase } from '@/identity/auth/use-cases/request-password-reset-otp.use-case';
import { ResetPasswordUseCase } from '@/identity/auth/use-cases';

@Public()
@Controller('auth/reset-password')
export class ResetPasswordController {
  constructor(
    private readonly requestPasswordResetOtpUseCase: RequestPasswordResetOtpUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('request-token')
  @ApiOkResponse({
    type: RequestPasswordResetTokenResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordOtp(@Body() input: RequestPasswordResetTokenDto) {
    return this.requestPasswordResetOtpUseCase.execute(input.email);
  }

  @Post('reset')
  @ApiOkResponse({
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(@Body() input: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(input);

    return {
      message: 'Password reset successful',
    };
  }
}
