import { Injectable } from '@nestjs/common';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { OtpTokenRepository } from '@/identity/auth/repositories/otp-token.repository';

@Injectable()
export class OtpService {
  constructor(
    private readonly hashService: HashService,
    private readonly otpTokenRepository: OtpTokenRepository,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtpToken(userId: string, tokenType: 'PASSWORD_RESET' | 'SIGNUP') {
    await this.otpTokenRepository.markAllAsUsed({
      userId,
      tokenType,
    });

    const otp = this.generateOtp();
    const tokenHash = this.hashService.sha256Hash(otp);
    const otpToken = await this.otpTokenRepository.create({
      userId,
      tokenType,
      tokenHash,
      expiresAt: this.generateTokenExpiry(new Date()),
    });

    return {
      otp,
      otpToken,
    };
  }

  async findToken(input: {
    token: string;
    tokenType?: 'PASSWORD_RESET' | 'SIGNUP';
  }) {
    const tokenHash = this.hashService.sha256Hash(input.token);

    return this.otpTokenRepository.findValidToken({
      tokenType: input.tokenType,
      tokenHash,
    });
  }

  generateTokenExpiry(date: Date) {
    return new Date(date.getTime() + 1000 * 60 * 5);
  }

  async expireToken(otpTokenId: string) {
    return this.otpTokenRepository.markAsUsed(otpTokenId);
  }
}
