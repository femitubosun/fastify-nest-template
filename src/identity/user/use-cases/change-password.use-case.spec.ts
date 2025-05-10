import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { Mocked } from 'jest-mock';
import { UserRepository } from '../repositories';
import { ChangePasswordUseCase } from './change-password.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('../repositories');
jest.mock('@/infrastructure/crypto/services/hash.service');

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: Mocked<UserRepository>;
  let hashService: Mocked<HashService>;

  const mockedUser = {
    id: '123',
    password: 'passwordHash',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangePasswordUseCase, UserRepository, HashService],
    }).compile();

    useCase = module.get(ChangePasswordUseCase);
    userRepository = module.get(UserRepository);
    hashService = module.get(HashService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should change password successfully', async () => {
    const input = {
      userId: '123',
      newPassword: 'newPassword',
      currentPassword: 'currentPassword',
    };

    userRepository.findUserWithPasswordById.mockResolvedValue(mockedUser);
    hashService.hash.mockResolvedValue('newPasswordHash');
    hashService.verify.mockResolvedValue(true);

    await useCase.execute(input);

    expect(userRepository.findUserWithPasswordById).toHaveBeenCalledWith(
      input.userId,
    );
    expect(hashService.hash).toHaveBeenCalledWith(input.newPassword);
    expect(userRepository.updatePassword).toHaveBeenCalledWith(
      input.userId,
      'newPasswordHash',
    );
  });

  it('should throw error if user not found', async () => {
    const input = {
      userId: '123',
      newPassword: 'newPassword',
      currentPassword: 'currentPassword',
    };

    userRepository.findUserWithPasswordById.mockResolvedValue(null);
    hashService.verify.mockResolvedValue(true);

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
  });

  it('should throw error if password is incorrect', async () => {
    const input = {
      userId: '123',
      newPassword: 'newPassword',
      currentPassword: 'currentPassword',
    };

    userRepository.findUserWithPasswordById.mockResolvedValue(mockedUser);
    hashService.verify.mockResolvedValue(false);

    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
  });

  it('should throw error if password is null', async () => {
    const input = {
      userId: '123',
      newPassword: 'newPassword',
      currentPassword: 'currentPassword',
    };

    const mockedUserResponse = {
      id: '123',
    };

    userRepository.findUserWithPasswordById.mockResolvedValue(
      mockedUserResponse,
    );

    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
  });
});
