import { RegisterUserUseCase } from '@/identity/auth/use-cases';
import { JwtService } from '@/infrastructure/crypto/services/jwt.service';
import { UserService } from '@/identity/user/services/user.service';
import { SessionService } from '@/identity/auth/services/session.service';
import { MailDispatcherService } from '@/infrastructure/mail/mail-dispatcher.service';
import { OtpService } from '@/identity/auth/services/otp.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('RegisterUserUseCase', () => {
  let registerUserUseCase: RegisterUserUseCase;
  let jwtService: JwtService;
  let userService: UserService;
  let sessionService: SessionService;
  let mailDispatcher: MailDispatcherService;
  let otpService: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: JwtService,
          useValue: {
            generateAuthToken: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            registerUser: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            initializeSession: jest.fn(),
          },
        },
        {
          provide: MailDispatcherService,
          useValue: {
            sendWelcomeMail: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            createOtpToken: jest.fn(),
          },
        },
      ],
    }).compile();

    registerUserUseCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    sessionService = module.get<SessionService>(SessionService);
    mailDispatcher = module.get<MailDispatcherService>(MailDispatcherService);
    otpService = module.get<OtpService>(OtpService);
  });

  const testCases = [
    {
      description: 'should register user successfully with valid input',
      input: {
        email: 'test@example.com',
        name: 'John Doe',
        password: 'password123',
      },
      userServiceResponse: {
        id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        password: 'password123',
      },
      otpServiceResponse: {
        otp: '123456',
        otpToken: {
          id: '123',
          userId: 'string',
          tokenType: 'SIGNUP' as const,
          tokenHash: 'string',
          expiresAt: new Date(),
          isUsed: false,
        },
      },
      sessionServiceResponse: 123,
      jwtServiceResponse: 'token123',
      expected: {
        message: 'User registered successfully',
        token: 'token123',
      },
    },
    {
      description: 'should handle missing name gracefully',
      input: { email: 'test@example.com', name: '', password: 'password123' },
      userServiceResponse: {
        id: 'user123',
        email: 'test@example.com',
        name: '',
        password: '',
      },
      otpServiceResponse: {
        otp: '123456',
        otpToken: {
          id: '123',
          userId: 'string',
          tokenType: 'SIGNUP' as const,
          tokenHash: 'string',
          expiresAt: new Date(),
          isUsed: false,
        },
      },
      sessionServiceResponse: 1,
      jwtServiceResponse: 'token123',
      expected: {
        message: 'User registered successfully',
        token: 'token123',
      },
    },
  ];

  testCases.forEach((testCase) => {
    it(testCase.description, async () => {
      jest
        .spyOn(userService, 'registerUser')
        .mockResolvedValue(testCase.userServiceResponse);

      jest
        .spyOn(otpService, 'createOtpToken')
        .mockResolvedValue(testCase.otpServiceResponse);

      jest
        .spyOn(mailDispatcher, 'sendWelcomeMail')
        .mockResolvedValue(undefined);
      jest
        .spyOn(sessionService, 'initializeSession')
        .mockResolvedValue(testCase.sessionServiceResponse);
      jest
        .spyOn(jwtService, 'generateAuthToken')
        .mockResolvedValue(testCase.jwtServiceResponse);

      const result = await registerUserUseCase.execute(testCase.input);
      expect(result).toEqual(testCase.expected);
    });
  });
});
