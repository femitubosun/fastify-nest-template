import { SessionService } from '@/identity/auth/services/session.service';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { LoginUserDto } from '@/identity/auth/__defs__/auth.dto';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/identity/user/services/user.service';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginUserDto) {
    const user = await this.userService.authenticateUser(input);
    const sessionVersion = await this.sessionService.refreshSession(user);
    const token = await this.jwtService.generateAuthToken(user, sessionVersion);

    return {
      message: 'User logged in successfully',
      token,
    };
  }
}
