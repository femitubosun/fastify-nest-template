import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '../__defs__/auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthResponseDto } from '../__defs__';
import { Public } from '../decorators/public.decorator';
import {
  LoginUserUseCase,
  RegisterUserUseCase,
} from '@/identity/auth/use-cases';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ZodSerializerDto(AuthResponseDto)
  @ApiCreatedResponse({
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto) {
    return this.registerUserUseCase.execute(body);
  }

  @Post('login')
  @ZodSerializerDto(AuthResponseDto)
  @ApiOkResponse({
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserDto) {
    return this.loginUserUseCase.execute(body);
  }
}
