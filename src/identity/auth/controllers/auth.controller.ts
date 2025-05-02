import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '../__defs__/auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto } from '../__defs__';
import { Public } from '../decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(AuthResponseDto)
  @ApiCreatedResponse({
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto) {
    return this.authService.registerUser(body);
  }

  @Post('login')
  @ZodSerializerDto(AuthResponseDto)
  @ApiOkResponse({
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserDto) {
    return this.authService.loginUser(body);
  }
}
