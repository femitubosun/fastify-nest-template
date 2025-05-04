import { Injectable } from '@nestjs/common';
import { HashService } from 'src/infrastructure/crypto/services/hash.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async markAllAsUsed(userId: string, tokenType: 'PASSWORD_RESET' | 'SIGNUP') {
    return this.prismaService.otpToken.updateMany({
      where: {
        userId,
        tokenType,
      },
      data: {
        isUsed: true,
      },
    });
  }

  async createOtpToken(userId: string, tokenType: 'PASSWORD_RESET' | 'SIGNUP') {
    await this.markAllAsUsed(userId, tokenType);

    const otp = this.generateOtp();

    const tokenHash = this.hashService.sha256Hash(otp);
    const otpToken = await this.prismaService.otpToken.create({
      data: {
        userId,
        tokenType,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    return {
      otp,
      otpToken,
    };
  }

  async findToken(token: string, tokenType?: 'PASSWORD_RESET' | 'SIGNUP') {
    const tokenHash = this.hashService.sha256Hash(token);

    return this.prismaService.otpToken.findFirst({
      where: {
        tokenHash,
        tokenType,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });
  }
}
