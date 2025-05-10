import { UserRepository } from '@/identity/user/repositories';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { SessionService } from '@/identity/auth/services/session.service';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { LoginUserDto } from '@/identity/auth/__defs__/auth.dto';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginUserDto) {
    const { email, password } = input;
    const user = await this.userRepository.findFullUserByEmail(email);

    if (!user?.password) {
      throw new BadRequestException('Invalid Authentication Method');
    }

    const isValidPassword = await this.hashService.verify(
      user.password,
      password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Invalid Password');
    }

    const session = await this.sessionService.getSession(user.id);

    if (!session) {
      throw new BadRequestException('Invalid Session');
    }

    const sessionVersion = session.sessionVersion + 1;
    const token = await this.jwtService.generateAuthToken(user, sessionVersion);
    await this.sessionService.createSession(user, sessionVersion);

    return {
      message: 'User logged in successfully',
      token,
    };
  }
}
