import { RegisterUserDto } from '@/identity/auth/__defs__/auth.dto';
import { SessionService } from '@/identity/auth/services/session.service';
import { UserService } from '@/identity/user/services/user.service';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { QNames } from '@/infrastructure/queue/__defs__/queue.dto';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { Injectable } from '@nestjs/common';
import { OtpService } from '../services/otp.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly queueService: QueueService,
    private readonly otpService: OtpService,
  ) {}

  async execute(input: RegisterUserDto) {
    const user = await this.userService.registerUser(input);
    const { otp } = await this.otpService.createOtpToken(user.id, 'SIGNUP');

    await this.queueService.addToQueue({
      queueName: QNames.sendMail,
      data: {
        email: user.email,
        subject: 'Welcome to app',
        context: {
          firstName: user.name?.split(' ')[0] || '',
          otp,
        },
      },
    });

    const sessionVersion = await this.sessionService.initializeSession(user);
    const token = await this.jwtService.generateAuthToken(user, sessionVersion);

    return {
      message: 'User registered successfully',
      token,
    };
  }
}
