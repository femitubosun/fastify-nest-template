import { RequestPasswordResetOtpUseCase } from '@/identity/auth/use-cases/request-password-reset-otp.use-case';
import { UserRepository } from '@/identity/user/repositories';
import { Mocked } from 'jest-mock';
import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from '@/identity/auth/services/otp.service';
import { OtpToken } from '@/infrastructure/prisma/__defs__';

jest.mock('@/identity/user/repositories');
jest.mock('@/identity/auth/services/otp.service');

describe('RequestPasswordResetOtpUseCase', () => {
  let useCase: RequestPasswordResetOtpUseCase;
  let mockedOtpService: Mocked<OtpService>;
  let mockedUserRepository: Mocked<UserRepository>;

  const testEmail = 'test@email.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestPasswordResetOtpUseCase, UserRepository, OtpService],
    }).compile();

    useCase = module.get<RequestPasswordResetOtpUseCase>(
      RequestPasswordResetOtpUseCase,
    );
    mockedUserRepository = module.get(UserRepository);
    mockedOtpService = module.get(OtpService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should send otp successfully', async () => {
    const expectedId = {
      id: '123',
    };
    const expectedOtpToken: OtpToken = {
      expiresAt: new Date(),
      id: '',
      isUsed: false,
      tokenHash: '',
      tokenType: 'PASSWORD_RESET',
      userId: '',
    };
    const expectedOtp = '123456';

    mockedOtpService.createOtpToken.mockResolvedValue({
      otpToken: expectedOtpToken,
      otp: expectedOtp,
    });
    mockedUserRepository.findIdByEmail.mockResolvedValue(expectedId);

    const result = await useCase.execute(testEmail);

    expect(result).toEqual({ message: 'Otp Token sent to email' });
    expect(mockedUserRepository.findIdByEmail).toHaveBeenCalledWith(testEmail);
    expect(mockedOtpService.createOtpToken).toHaveBeenCalledWith(
      expectedId.id,
      'PASSWORD_RESET',
    );
  });

  it('should not create an otp token for a non-existent user', async () => {
    mockedUserRepository.findIdByEmail.mockResolvedValue(null);

    const result = await useCase.execute(testEmail);

    expect(result).toEqual({ message: 'Otp Token sent to email' });
    expect(mockedUserRepository.findIdByEmail).toHaveBeenCalledWith(testEmail);
    expect(mockedOtpService.createOtpToken).not.toHaveBeenCalled();
  });
});
