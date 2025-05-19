import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Mocked } from 'jest-mock';
import { User } from '@/infrastructure/prisma/__defs__';
import { RedisService } from '@/infrastructure/cache/services/redis.service';
import { SessionUserSchema } from '../__defs__';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let redisService: Mocked<RedisService>;
  let configService: Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SessionService);
    redisService = module.get(RedisService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a session for a given user', async () => {
    configService.get.mockReturnValue(3600);

    const user = {
      id: '123',
      name: 'Test Test',
      email: 'test@test.com',
      password: 'oldHash',
    } as User;
    const sessionVersion = 1;

    await service.createSession(user, sessionVersion);

    expect(redisService.set).toHaveBeenCalledWith({
      key: `session:${user.id}`,
      value: expect.objectContaining({
        id: '123',
        email: 'test@test.com',
        name: 'Test Test',
        sessionVersion,
      }) as unknown,
      ttlSeconds: 3600,
    });
  });

  it('should retrieve a session for a given userId', async () => {
    const sessionUser: SessionUserSchema = {
      id: '123',
      name: 'Test Test',
      email: 'test@test.com',
      sessionVersion: 1,
      roles: [],
    };
    redisService.get.mockResolvedValue(sessionUser);

    const result = await service.getSession('123');

    expect(redisService.get).toHaveBeenCalledWith(`session:123`);
    expect(result).toEqual(sessionUser);
  });
});
