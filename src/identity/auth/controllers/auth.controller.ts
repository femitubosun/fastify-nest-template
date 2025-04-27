import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserDto } from '../__defs__/auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  @Post()
  @ZodSerializerDto(RegisterUserDto)
  @ApiCreatedResponse({
    type: RegisterUserDto,
  })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterUserDto): RegisterUserDto {
    return body;
  }
}
