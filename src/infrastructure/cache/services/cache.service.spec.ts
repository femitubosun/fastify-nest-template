import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  sAdd: jest.fn(),
  scan: jest.fn(),
  sMembers: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new CacheService(
      mockRedisService as unknown as RedisService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('fetch', () => {
    it('should return cached value when present', async () => {
      mockRedisService.get.mockResolvedValue('cached-value');
      const resolver = jest.fn();

      const result = await cacheService.fetch([1, 'test'], {
        key: `key-a-b`,
        resolver,
      });

      expect(result).toBe('cached-value');
      expect(resolver).not.toHaveBeenCalled();
    });

    it('should call resolver and cache result on miss', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const resolver = jest.fn().mockResolvedValue('new-value');

      const result = await cacheService.fetch([], {
        key: 'test-key',
        resolver,
        tags: ['tag1'],
        ttlSeconds: 60,
      });

      expect(result).toBe('new-value');
      expect(mockRedisService.set).toHaveBeenCalledWith({
        key: 'app:test-key',
        value: 'new-value',
        ttlSeconds: 60,
      });
      expect(mockRedisService.sAdd).toHaveBeenCalledWith(
        'tagset:tag1',
        'app:test-key',
      );
    });
  });

  describe('invalidate', () => {
    it('should delete single key', async () => {
      await cacheService.invalidate('key1');
      expect(mockRedisService.delete).toHaveBeenCalledWith(['app:key1']);
    });

    it('should delete multiple keys', async () => {
      await cacheService.invalidate(['key1', 'key2']);
      expect(mockRedisService.delete).toHaveBeenCalledWith([
        'app:key1',
        'app:key2',
      ]);
    });
  });

  describe('invalidateByPrefix', () => {
    it('should delete keys matching prefix', async () => {
      mockRedisService.scan.mockImplementation(function* () {
        yield 'prefix:key1';
        yield 'prefix:key2';
      });

      await cacheService.invalidateByPrefix('prefix:');
      expect(mockRedisService.delete).toHaveBeenCalledWith([
        'prefix:key1',
        'prefix:key2',
      ]);
    });
  });

  describe('invalidateByTag', () => {
    it('should delete tag set and associated keys', async () => {
      mockRedisService.sMembers.mockResolvedValue(['key1', 'key2']);

      await cacheService.invalidateByTag('tag1');
      expect(mockRedisService.delete).toHaveBeenCalledWith([
        'key1',
        'key2',
        'tagset:tag1',
      ]);
    });
  });

  describe('basic operations', () => {
    it('should set value', async () => {
      await cacheService.set('key', 'value', 60);
      expect(mockRedisService.set).toHaveBeenCalledWith({
        key: 'app:key',
        value: 'value',
        ttlSeconds: 60,
      });
    });

    it('should get value', async () => {
      await cacheService.get('key');
      expect(mockRedisService.get).toHaveBeenCalledWith('app:key');
    });

    it('should delete keys', async () => {
      await cacheService.delete(['key1', 'key2']);
      expect(mockRedisService.delete).toHaveBeenCalledWith([
        'app:key1',
        'app:key2',
      ]);
    });
  });
});
