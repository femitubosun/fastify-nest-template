import { Module } from '@nestjs/common';
import { ChangePasswordController } from './controllers/change-password.controller';
import { UserRepository } from '@/identity/user/repositories';
import { ChangePasswordUseCase } from '@/identity/user/use-cases/change-password.use-case';

const USE_CASES = [ChangePasswordUseCase];
const REPOSITORIES = [UserRepository];

@Module({
  providers: [...REPOSITORIES, ...USE_CASES],
  controllers: [ChangePasswordController],
  exports: [...REPOSITORIES],
})
export class UserModule {}
