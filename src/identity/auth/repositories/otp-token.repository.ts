import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  CreateOtpTokenSchema,
  FindValidTokenSchema,
  MarkAllAsUsedSchema,
} from '@/identity/auth/__defs__/otp-token.dto';

@Injectable()
export class OtpTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: CreateOtpTokenSchema) {
    return this.prismaService.otpToken.create({
      data: {
        userId: input.userId,
        tokenType: input.tokenType,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  async markAllAsUsed(input: MarkAllAsUsedSchema) {
    return this.prismaService.otpToken.updateMany({
      where: input,
      data: {
        isUsed: true,
      },
    });
  }

  async findValidToken(input: FindValidTokenSchema) {
    return this.prismaService.otpToken.findFirst({
      where: {
        ...input,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markAsUsed(id: string) {
    return this.prismaService.otpToken.update({
      where: { id },
      data: {
        isUsed: true,
      },
    });
  }
}
