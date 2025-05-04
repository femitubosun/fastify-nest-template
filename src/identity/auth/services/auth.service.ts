import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RegisterUserDto } from '../__defs__/auth.dto';
import { SessionService } from './session.service';
import { JwtService } from 'src/infrastructure/crypto/services/jwt.service';
import { HashService } from 'src/infrastructure/crypto/services/hash.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly sessionService: SessionService,
  ) {}

  async registerUser(input: RegisterUserDto) {
    const { email, name, password } = input;

    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: await this.hashService.hash(password),
        name,
      },
    });

    const sessionVersion = 1;
    await this.sessionService.createSession(user, sessionVersion);

    const token = await this.jwtService.generateAuthToken(user, sessionVersion);

    return {
      message: 'User registered successfully',
      token,
    };
  }

  async loginUser(body: RegisterUserDto) {
    const { email, password } = body;
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });

    if (!user?.password) {
      throw new BadRequestException('Invaliad Authentication Method');
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
