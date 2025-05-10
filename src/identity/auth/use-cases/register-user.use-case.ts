import { RegisterUserDto } from '@/identity/auth/__defs__/auth.dto';
import { SessionService } from '@/identity/auth/services/session.service';
import { UserService } from '@/identity/user/services/user.service';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { Injectable } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { MailDispatcherService } from '@/infrastructure/mail/mail-dispatcher.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly mailDispatcher: MailDispatcherService,
    private readonly otpService: OtpService,
  ) {}

  async execute(input: RegisterUserDto) {
    const user = await this.userService.registerUser(input);
    const { otp } = await this.otpService.createOtpToken(user.id, 'SIGNUP');

    await this.mailDispatcher.sendWelcomeMail({
      email: user.email,
      otp,
      firstName: user.name?.split(' ')[0] || '',
    });

    const sessionVersion = await this.sessionService.initializeSession(user);
    const token = await this.jwtService.generateAuthToken(user, sessionVersion);

    return {
      message: 'User registered successfully',
      token,
    };
  }
}
