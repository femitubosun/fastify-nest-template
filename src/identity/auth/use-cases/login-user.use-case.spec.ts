import { LoginUserUseCase } from './login-user.use-case';
import { UserRepository } from '@/identity/user/repositories';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { SessionService } from '@/identity/auth/services/session.service';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { LoginUserDto } from '@/identity/auth/__defs__/auth.dto';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mocked } from 'jest-mock';
import { SessionUserSchema } from '@/identity/auth/__defs__';

jest.mock('@/identity/user/repositories');
jest.mock('@/infrastructure/crypto/services/hash.service');
jest.mock('@/identity/auth/services/session.service');
jest.mock('@/infrastructure/crypto/services/jwt.service');

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let userRepository: Mocked<UserRepository>;
  let hashService: Mocked<HashService>;
  let sessionService: Mocked<SessionService>;
  let jwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        UserRepository,
        HashService,
        SessionService,
        JwtService,
      ],
    }).compile();

    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get(UserRepository);
    hashService = module.get(HashService);
    sessionService = module.get(SessionService);
    jwtService = module.get(JwtService);
  });

  it('should login successfully', async () => {
    const input: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const user = {
      id: '1',
      password: 'hashedPassword',
      email: '',
      name: '',
    };
    const session: SessionUserSchema = {
      email: '',
      id: '',
      name: '',
      roles: [],
      sessionVersion: 1,
    };
    const token = 'jwtToken';

    userRepository.findFullUserByEmail.mockResolvedValue(user);
    hashService.verify.mockResolvedValue(true);
    sessionService.getSession.mockResolvedValue(session);
    jwtService.generateAuthToken.mockResolvedValue(token);

    const result = await loginUserUseCase.execute(input);

    expect(result).toEqual({ message: 'User logged in successfully', token });
  });

  it('should throw Invalid Authentication Method', async () => {
    const input: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    userRepository.findFullUserByEmail.mockResolvedValue(null);

    await expect(loginUserUseCase.execute(input)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw Invalid Password', async () => {
    const input: LoginUserDto = {
      email: 'test@example.com',
      password: 'wrongPassword',
    };
    const user = {
      id: '1',
      password: 'hashedPassword',
      name: 'Test test',
      email: 'test@example.com',
    };

    userRepository.findFullUserByEmail.mockResolvedValue(user);
    hashService.verify.mockResolvedValue(false);

    await expect(loginUserUseCase.execute(input)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw Invalid Session', async () => {
    const input: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    const user = {
      id: '1',
      password: 'hashedPassword',
      name: 'Test test',
      email: 'test@example.com',
    };

    userRepository.findFullUserByEmail.mockResolvedValue(user);
    hashService.verify.mockResolvedValue(true);
    sessionService.getSession.mockResolvedValue(null);

    await expect(loginUserUseCase.execute(input)).rejects.toThrow(
      BadRequestException,
    );
  });
});
