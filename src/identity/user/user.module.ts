import { Module } from '@nestjs/common';
import { ChangePasswordController } from './controllers/change-password.controller';
import { PasswordService } from './services/password.service';

@Module({
  providers: [PasswordService],
  controllers: [ChangePasswordController],
})
export class UserModule {}
