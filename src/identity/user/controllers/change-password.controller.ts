import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { AuthedRequest, MessageResponseDto } from 'src/common/__defs__';
import { ChangePasswordDto } from '../__defs__';
import { PasswordService } from '@/identity/user/services/password.service';

@Controller('users')
export class ChangePasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post('change-password')
  @ZodSerializerDto(MessageResponseDto)
  @ApiOkResponse({ type: MessageResponseDto })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Request() req: AuthedRequest,
  ) {
    await this.passwordService.changePassword({
      userId: req.user.id,
      ...body,
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
