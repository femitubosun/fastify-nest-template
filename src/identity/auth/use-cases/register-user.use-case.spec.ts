import { RegisterUserDto } from '@/identity/auth/__defs__/auth.dto';
import { SessionService } from '@/identity/auth/services/session.service';
import { RegisterUserUseCase } from '@/identity/auth/use-cases/register-user.use-case';
import { UserRepository } from '@/identity/user/repositories';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mocked } from 'jest-mock';

jest.mock('@/identity/user/repositories');
jest.mock('@/infrastructure/crypto/services/hash.service');
jest.mock('@/identity/auth/services/session.service');
jest.mock('@/infrastructure/crypto/services/jwt.service');

describe('RegisterUser', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: Mocked<UserRepository>;
  let hashService: Mocked<HashService>;
  let sessionService: Mocked<SessionService>;
  let jwtService: Mocked<JwtService>;

  const mockedUser = {
    id: '123',
    name: 'Test Test',
    email: 'test@email.com',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        UserRepository,
        HashService,
        SessionService,
        JwtService,
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
    userRepository = module.get(UserRepository);
    hashService = module.get(HashService);
    sessionService = module.get(SessionService);
    jwtService = module.get(JwtService);
  });

  it('should register successfully', async () => {
    const input: RegisterUserDto = {
      email: mockedUser.email,
      password: 'password',
      name: 'Test',
    };
    const expectedToken = 'jwtToken';
    const expectedPasswordHash = 'hashedPassword';

    userRepository.findIdByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockedUser);
    jwtService.generateAuthToken.mockResolvedValue(expectedToken);
    hashService.hash.mockResolvedValue(expectedPasswordHash);

    const result = await useCase.execute(input);

    expect(userRepository.findIdByEmail).toHaveBeenCalledWith(input.email);
    expect(userRepository.create).toHaveBeenCalledWith({
      ...input,
      password: expectedPasswordHash,
    });
    expect(sessionService.createSession).toHaveBeenCalledWith(mockedUser, 1);
    expect(jwtService.generateAuthToken).toHaveBeenCalledWith(mockedUser, 1);

    expect(result).toEqual({
      message: 'User registered successfully',
      token: expectedToken,
    });
  });

  it('should throw error if user already exists', async () => {
    const input: RegisterUserDto = {
      email: mockedUser.email,
      password: 'password',
      name: 'Test Test',
    };

    userRepository.findIdByEmail.mockResolvedValue({ id: mockedUser.id });

    await expect(useCase.execute(input)).rejects.toThrowError(
      new ConflictException('User already exists'),
    );
  });

  it('should hash the password before saving', async () => {
    const input: RegisterUserDto = {
      email: mockedUser.email,
      password: 'password',
      name: 'Test',
    };
    const expectedPasswordHash = 'hashedPassword';

    userRepository.findIdByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockedUser);
    hashService.hash.mockResolvedValue(expectedPasswordHash);

    await useCase.execute(input);

    expect(hashService.hash).toHaveBeenCalledTimes(1);
    expect(hashService.hash).toHaveBeenCalledWith(input.password);
  });

  it('should generate a token with the correct user and session version', async () => {
    const input: RegisterUserDto = {
      email: mockedUser.email,
      password: 'password',
      name: 'Test',
    };

    const expectedPasswordHash = 'hashedPassword';
    const expectedSessionVersion = 1;

    hashService.hash.mockResolvedValue(expectedPasswordHash);
    userRepository.findIdByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockedUser);
    jwtService.generateAuthToken.mockResolvedValue('jwtToken');

    await useCase.execute(input);

    expect(jwtService.generateAuthToken).toHaveBeenCalledWith(
      mockedUser,
      expectedSessionVersion,
    );
  });
});
