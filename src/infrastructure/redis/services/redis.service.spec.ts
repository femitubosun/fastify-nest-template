import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  scanIterator: jest.fn(),
  disconnect: jest.fn(),
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should set string value without TTL', async () => {
      await service.set({ key: 'test', value: 'value' });
      expect(mockRedisClient.set).toHaveBeenCalledWith('test', 'value');
    });

    it('should set object value without TTL', async () => {
      const value = { test: 'value' };
      await service.set({ key: 'test', value });
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test',
        JSON.stringify(value),
      );
    });

    it('should set value with TTL', async () => {
      await service.set({ key: 'test', value: 'value', ttlSeconds: 60 });
      expect(mockRedisClient.set).toHaveBeenCalledWith('test', 'value', {
        EX: 60,
      });
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const result = await service.get('test');
      expect(result).toBeNull();
    });

    it('should return parsed JSON for object values', async () => {
      const value = { test: 'value' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));
      const result = await service.get('test');
      expect(result).toEqual(value);
    });

    it('should return raw value for non-JSON strings', async () => {
      mockRedisClient.get.mockResolvedValue('value');
      const result = await service.get('test');
      expect(result).toBe('value');
    });
  });

  describe('delete', () => {
    it('should delete key', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      await service.delete('test');
      expect(mockRedisClient.del).toHaveBeenCalledWith('test');
    });
  });

  //   describe('scan', () => {
  //     it('should yield keys matching pattern', async () => {
  //       const keys = ['key1', 'key2'];
  //       mockRedisClient.scanIterator.mockReturnValue(keys);
  //       const result = [];
  //       for await (const key of service.scan('test*')) {
  //         result.push(key);
  //       }
  //       expect(result).toEqual(keys);
  //       expect(mockRedisClient.scanIterator).toHaveBeenCalledWith({
  //         MATCH: 'test*',
  //       });
  //     });

  //     it('should use default pattern if none provided', async () => {
  //       await service.scan().next();
  //       expect(mockRedisClient.scanIterator).toHaveBeenCalledWith({ MATCH: '*' });
  //     });
  //   });

  describe('onModuleDestroy', () => {
    it('should disconnect redis client', async () => {
      await service.onModuleDestroy();
      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });
  });
});
