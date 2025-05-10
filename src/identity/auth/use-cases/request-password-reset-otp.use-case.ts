import { Injectable } from '@nestjs/common';
import { OtpService } from '@/identity/auth/services/otp.service';
import { UserRepository } from '@/identity/user/repositories';

@Injectable()
export class RequestPasswordResetOtpUseCase {
  constructor(
    private readonly otpService: OtpService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string) {
    const OTP_TOKEN_SENT = 'Otp Token sent to email';
    const user = await this.userRepository.findIdByEmail(email);

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
}
