import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { UserRepository } from '@/identity/user/repositories';
import { ChangePasswordDto } from '@/identity/user/__defs__';

export type ChangePasswordUseCaseInput = ChangePasswordDto & {
  userId: string;
};

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ChangePasswordUseCaseInput) {
    const { currentPassword, newPassword, userId } = input;

    const user = await this.userRepository.findUserWithPasswordById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (!user.password) {
      throw new BadRequestException('Invalid Auth Method');
    }

    const valid = await this.hashService.verify(user.password, currentPassword);

    if (!valid) {
      throw new BadRequestException('Invalid credentials');
    }

    await this.userRepository.updatePassword(
      user.id,
      await this.hashService.hash(newPassword),
    );
  }
}
