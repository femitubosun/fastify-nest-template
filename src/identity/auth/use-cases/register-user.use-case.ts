import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { SessionService } from '@/identity/auth/services/session.service';
import { UserRepository } from '@/identity/user/repositories';
import { RegisterUserDto } from '@/identity/auth/__defs__/auth.dto';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { QNames } from '@/infrastructure/queue/__defs__/queue.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly sessionService: SessionService,
    private readonly queueService: QueueService,
  ) {}

  async execute(input: RegisterUserDto) {
    const { email, name, password } = input;

    const existingUser = await this.userRepository.findIdByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.userRepository.create({
      email,
      name,
      password: await this.hashService.hash(password),
    });

    await this.queueService.addToQueue({
      data: user,
      queueName: QNames.sendMail,
    });

    const sessionVersion = 1;
    await this.sessionService.createSession(user, sessionVersion);

    const token = await this.jwtService.generateAuthToken(user, sessionVersion);

    return {
      message: 'User registered successfully',
      token,
    };
  }
}
