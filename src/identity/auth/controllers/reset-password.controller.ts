import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  RequestPasswordResetTokenDto,
  RequestPasswordResetTokenResponseDto,
  ResetPasswordDto,
} from '../__defs__/password.dto';

import { MessageResponseDto } from 'src/common/__defs__';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { OtpService } from '../services/otp.service';
import { HashService } from 'src/infrastructure/crypto/services/hash.service';
import { Public } from '../decorators/public.decorator';

@Public()
@Controller('auth/reset-password')
export class ResetPasswordController {
  constructor(
    private readonly otpService: OtpService,
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  @Post('request-token')
  @ApiOkResponse({
    type: RequestPasswordResetTokenResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordOtp(@Body() input: RequestPasswordResetTokenDto) {
    const OTP_TOKEN_SENT = 'Otp Token sent to email';

    const user = await this.prismaService.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return {
        message: OTP_TOKEN_SENT,
      };
    }

    const { otp } = await this.otpService.createOtpToken(
      user.id,
      'PASSWORD_RESET',
    );

    // TODO send otp to email
    console.log('otp', otp);

    return {
      message: OTP_TOKEN_SENT,
    };
  }

  @Post('reset')
  @ApiOkResponse({
    type: MessageResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(@Body() input: ResetPasswordDto) {
    const { token, password } = input;

    const otpToken = await this.otpService.findToken(token);

    if (!otpToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.prismaService.user.update({
      where: {
        id: otpToken.userId,
      },
      data: {
        password: await this.hashService.hash(password),
      },
    });

    return {
      message: 'Password reset successful',
    };
  }
}
