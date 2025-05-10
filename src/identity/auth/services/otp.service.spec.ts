import { Mocked } from 'jest-mock';
import { OtpService } from './otp.service';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { Test, TestingModule } from '@nestjs/testing';
import { OtpToken } from '@/infrastructure/prisma/__defs__';
import { OtpTokenRepository } from '@/identity/auth/repositories/otp-token.repository';

jest.mock('@/identity/auth/repositories/otp-token.repository');

describe('OtpService', () => {
  let service: OtpService;
  let otpTokenRepository: Mocked<OtpTokenRepository>;
  let hashService: Mocked<HashService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: OtpTokenRepository,
          useValue: {
            create: jest.fn(),
            findValidToken: jest.fn(),
            markAllAsUsed: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            sha256Hash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpTokenRepository = module.get(OtpTokenRepository);
    hashService = module.get(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate otp', () => {
    const otp = service.generateOtp();
    expect(otp).toHaveLength(6);
    expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
    expect(parseInt(otp)).toBeLessThanOrEqual(999999);
  });

  it('should return a date 5 minutes after the input date', () => {
    const now = new Date();
    const result = service.generateTokenExpiry(now);
    expect(result.getTime()).toBe(now.getTime() + 1000 * 60 * 5);
  });

  it('should create otpToken', async () => {
    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);

    const expectedOtp = '123456';
    const expectedHash = 'hashedToken';
    const expectedExpiresAt = new Date(now + 1000 * 60 * 5);

    const mockOtpToken: OtpToken = {
      id: '123',
      tokenType: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: expectedExpiresAt,
      userId: '123',
      tokenHash: expectedHash,
    };

    jest.spyOn(service, 'generateOtp').mockReturnValue(expectedOtp);
    jest
      .spyOn(service, 'generateTokenExpiry')
      .mockReturnValue(expectedExpiresAt);
    hashService.sha256Hash.mockReturnValue('hashedToken');
    otpTokenRepository.create.mockResolvedValue(mockOtpToken);

    const result = await service.createOtpToken('123', 'PASSWORD_RESET');

    expect(hashService.sha256Hash).toHaveBeenCalledWith(expectedOtp);
    expect(otpTokenRepository.create).toHaveBeenCalledWith({
      userId: '123',
      tokenType: 'PASSWORD_RESET',
      tokenHash: expectedHash,
      expiresAt: expectedExpiresAt,
    });

    expect(result).toEqual({
      otp: expectedOtp,
      otpToken: mockOtpToken,
    });
  });

  it('should find token', async () => {
    const token = '123456';
    const expectedTokenHash = 'hashedToken';
    const mockOtpToken: OtpToken = {
      id: '123',
      tokenType: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: new Date(),
      userId: '123',
      tokenHash: expectedTokenHash,
    };

    hashService.sha256Hash.mockReturnValue(expectedTokenHash);
    otpTokenRepository.findValidToken.mockResolvedValue(mockOtpToken);

    const result = await service.findToken({
      token,
      tokenType: 'PASSWORD_RESET',
    });

    expect(hashService.sha256Hash).toHaveBeenCalledWith(token);
    expect(otpTokenRepository.findValidToken).toHaveBeenCalledWith({
      tokenHash: expectedTokenHash,
      tokenType: 'PASSWORD_RESET',
    });
    expect(result).toEqual(mockOtpToken);
  });

  it('should expire token', async () => {
    const mockOtpToken: OtpToken = {
      id: '123',
      tokenType: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: new Date(),
      userId: '123',
      tokenHash: 'hashedToken',
    };

    otpTokenRepository.markAsUsed.mockResolvedValue(mockOtpToken);

    const result = await service.expireToken('123');

    expect(otpTokenRepository.markAsUsed).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockOtpToken);
  });
});
