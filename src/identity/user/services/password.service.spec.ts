import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Mocked } from 'jest-mock';
import { BadRequestException } from '@nestjs/common';

describe('PasswordService', () => {
  let service: PasswordService;
  let hashService: Mocked<HashService>;
  let prisma: Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: HashService,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirstOrThrow: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(PasswordService);
    hashService = module.get(HashService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(hashService).toBeDefined();
  });

  it('should hash a password', async () => {
    hashService.hash.mockResolvedValue('hashedValue');

    const result = await service.hashPassword('plaintext');
    expect(result).toBe('hashedValue');
    expect(hashService.hash).toHaveBeenCalledWith('plaintext');
  });

  it('should verify a password', async () => {
    hashService.verify.mockResolvedValue(true);

    const result = await service.verifyPassword('plaintext', 'hashedValue');

    expect(result).toBe(true);
    expect(hashService.verify).toHaveBeenCalledWith('hashedValue', 'plaintext');
  });

  it('should change password successfully', async () => {
    prisma.user.findFirstOrThrow.mockResolvedValue({
      id: '123',
      email: 'test@test.com',
      name: 'Test Test',
      password: 'oldHash',
    });

    hashService.verify.mockResolvedValue(true);
    hashService.hash.mockResolvedValue('newHash');

    await service.changePassword({
      userId: '123',
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
    });

    expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      select: {
        id: true,
        password: true,
      },
    });
    expect(hashService.verify).toHaveBeenCalledWith(
      'oldHash',
      'currentPassword',
    );
    expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      select: {
        id: true,
        password: true,
      },
    });
  });

  it('should throw if current password is invalid', async () => {
    prisma.user.findFirstOrThrow.mockResolvedValue({
      id: '123',
      email: 'test@test.com',
      name: 'Test Test',
      password: 'oldHash',
    });
    hashService.verify.mockResolvedValue(false);

    await expect(
      service.changePassword({
        userId: '123',
        currentPassword: 'wrongPass',
        newPassword: 'newPass',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should throw if user is not found', async () => {
    prisma.user.findFirstOrThrow.mockRejectedValue(new Error('User not found'));

    await expect(
      service.changePassword({
        userId: 'invalidId',
        currentPassword: 'pass',
        newPassword: 'pass',
      }),
    ).rejects.toThrow('User not found');
  });
});
