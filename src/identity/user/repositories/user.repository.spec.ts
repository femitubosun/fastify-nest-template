import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@/infrastructure/prisma/__defs__';

const mockUser: User = {
  id: 'user-id-123',
  email: 'test@example.com',
  password: 'hashedPassword123',
  name: 'Test User',
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findIdByEmail', () => {
    it('should return user id if user exists', async () => {
      const email = 'test@example.com';
      const expectedResult = { id: mockUser.id };

      mockPrismaService.user.findFirst.mockResolvedValue(expectedResult);

      const result = await repository.findIdByEmail(email);

      expect(result).toEqual(expectedResult);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email },
        select: { id: true },
      });
    });

    it('should return null if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await repository.findIdByEmail(email);

      expect(result).toBeNull();
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email },
        select: { id: true },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserData = {
        email: 'newuser@example.com',
        password: 'newPassword123',
        name: 'New User',
      };

      const createdUser = {
        id: 'new-user-id', // Prisma would generate an ID
        ...createUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await repository.create(createUserData);

      expect(result).toEqual(createdUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserData,
      });
    });

    it('should create a user without a name if not provided', async () => {
      const createUserData = {
        email: 'newuser2@example.com',
        password: 'newPassword456',
      };
      const createdUser = {
        id: 'new-user-id-2',
        email: createUserData.email,
        password: createUserData.password,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await repository.create(createUserData);

      expect(result).toEqual(createdUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserData, // Prisma handles optional 'name' correctly
      });
    });
  });

  describe('findFullUserByEmail', () => {
    it('should return the full user object if user exists', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findFullUserByEmail(email);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await repository.findFullUserByEmail(email);

      expect(result).toBeNull();
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
