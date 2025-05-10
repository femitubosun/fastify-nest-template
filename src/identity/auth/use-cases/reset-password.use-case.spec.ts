import { ResetPasswordUseCase } from '@/identity/auth/use-cases/reset-password.use-case';
import { Mocked } from 'jest-mock';
import { OtpService } from '@/identity/auth/services/otp.service';
import { UserRepository } from '@/identity/user/repositories';
import { Test, TestingModule } from '@nestjs/testing';
import { OtpToken } from '@/infrastructure/prisma/__defs__';

jest.mock('@/identity/auth/services/otp.service');
jest.mock('@/identity/user/repositories');

describe('Reset Password Use Case', () => {
  let useCase: ResetPasswordUseCase;
  let mockedOtpService: Mocked<OtpService>;
  let mockedUserRepository: Mocked<UserRepository>;

  const input = {
    token: '123456',
    password: 'newPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResetPasswordUseCase, OtpService, UserRepository],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    mockedOtpService = module.get<Mocked<OtpService>>(OtpService);
    mockedUserRepository = module.get<Mocked<UserRepository>>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should reset password successfully', async () => {
    const expectedOtpToken: OtpToken = {
      expiresAt: new Date(),
      id: '1234',
      isUsed: false,
      tokenHash: 'tokenHash',
      tokenType: 'PASSWORD_RESET',
      userId: '111',
    };

    mockedOtpService.findToken.mockResolvedValue(expectedOtpToken);

    await useCase.execute(input);

    expect(mockedOtpService.findToken).toHaveBeenCalledWith({
      token: input.token,
      tokenType: 'PASSWORD_RESET',
    });

    expect(mockedOtpService.expireToken).toHaveBeenCalledWith(
      expectedOtpToken.id,
    );
    expect(mockedUserRepository.updatePassword).toHaveBeenCalledWith(
      expectedOtpToken.userId,
      input.password,
    );
  });

  it('should throw if token not found', async () => {
    mockedOtpService.findToken.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow('Invalid token');
  });
});
