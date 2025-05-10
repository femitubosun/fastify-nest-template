import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { UserService } from '@/identity/user/services/user.service';
import { SessionService } from '@/identity/auth/services/session.service';
import { RegisterUserDto } from '@/identity/auth/__defs__/auth.dto';
import { OtpToken, User } from '@/infrastructure/prisma/__defs__';
import { Mocked } from 'jest-mock';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { OtpService } from '@/identity/auth/services/otp.service';
import { QNames } from '@/infrastructure/queue/__defs__/queue.dto';

const mockRegisterDto: RegisterUserDto = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
};

const mockUser: User = {
  id: 'user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
};

const mockSessionVersion = 1;

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockedJwtService: Mocked<JwtService>;
  let mockedUserService: Mocked<UserService>;
  let mockedSessionService: Mocked<SessionService>;
  let mockedQueueService: Mocked<QueueService>;
  let mockedOtpService: Mocked<OtpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: JwtService,
          useValue: { generateAuthToken: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { registerUser: jest.fn() },
        },
        {
          provide: SessionService,
          useValue: { initializeSession: jest.fn() },
        },
        {
          provide: QueueService,
          useValue: { addToQueue: jest.fn() },
        },
        {
          provide: OtpService,
          useValue: { createOtpToken: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    mockedJwtService = module.get(JwtService);
    mockedUserService = module.get(UserService);
    mockedSessionService = module.get(SessionService);
    mockedQueueService = module.get(QueueService);
    mockedOtpService = module.get(OtpService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully register a user and initialize a session', async () => {
      mockedUserService.registerUser.mockResolvedValue(mockUser);
      mockedSessionService.initializeSession.mockResolvedValue(
        mockSessionVersion,
      );
      mockedOtpService.createOtpToken.mockResolvedValue({
        otp: 'string',
        otpToken: {} as OtpToken,
      });
      const mockedToken = 'adfdfdf';
      mockedJwtService.generateAuthToken.mockResolvedValue(mockedToken);

      const result = await useCase.execute(mockRegisterDto);

      expect(mockedUserService.registerUser).toHaveBeenCalledWith(
        mockRegisterDto,
      );
      expect(mockedSessionService.initializeSession).toHaveBeenCalledWith(
        mockUser,
      );
      expect(mockedQueueService.addToQueue).toHaveBeenCalledWith({
        queueName: QNames.sendMail,
        data: {
          email: mockUser.email,
          subject: 'Welcome to app',
          context: {
            firstName: mockUser.name?.split(' ')[0] || '',
            otp: 'string',
          },
        },
      });

      expect(result).toEqual({
        message: 'User registered successfully',
        token: mockedToken,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const errorMessage = 'User already exists';
      mockedUserService.registerUser.mockRejectedValue(
        new ConflictException(errorMessage),
      );

      await expect(useCase.execute(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(mockRegisterDto)).rejects.toThrow(
        errorMessage,
      );

      expect(mockedUserService.registerUser).toHaveBeenCalledWith(
        mockRegisterDto,
      );
      expect(mockedSessionService.initializeSession).not.toHaveBeenCalled();
    });
  });
});
