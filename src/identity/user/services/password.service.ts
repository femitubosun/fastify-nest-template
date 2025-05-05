import { BadRequestException, Injectable } from '@nestjs/common';
import { HashService } from 'src/infrastructure/crypto/services/hash.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly hashService: HashService,
    private readonly prismaService: PrismaService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return this.hashService.hash(password);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return this.hashService.verify(hashedPassword, password);
  }

  async changePassword(input: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const user = await this.prismaService.user.findFirstOrThrow({
      where: {
        id: input.userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    const valid = await this.hashService.verify(
      user.password,
      input.currentPassword,
    );

    if (!valid) {
      throw new BadRequestException('Invalid credentials');
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await this.hashService.hash(input.newPassword),
      },
    });
  }
}
