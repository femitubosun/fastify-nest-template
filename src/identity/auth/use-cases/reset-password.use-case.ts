import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpService } from '@/identity/auth/services/otp.service';
import { UserRepository } from '@/identity/user/repositories';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly otpService: OtpService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: { token: string; password: string }) {
    const { token, password } = input;
    const otpToken = await this.otpService.findToken({
      token,
      tokenType: 'PASSWORD_RESET',
    });

    if (!otpToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.otpService.expireToken(otpToken.id);
    await this.userRepository.updatePassword(otpToken.userId, password);
  }
}
