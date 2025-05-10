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
import { ChangePasswordUseCase } from '@/identity/user/use-cases/change-password.use-case';

@Controller('users')
export class ChangePasswordController {
  constructor(private readonly changePasswordUseCase: ChangePasswordUseCase) {}

  @Post('change-password')
  @ZodSerializerDto(MessageResponseDto)
  @ApiOkResponse({ type: MessageResponseDto })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Request() req: AuthedRequest,
  ) {
    await this.changePasswordUseCase.execute({
      ...body,
      userId: req.user.id,
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
