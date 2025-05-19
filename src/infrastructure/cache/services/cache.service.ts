import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

const TAG_SET_PREFIX = 'tagset:';

@Injectable()
export class CacheService {
  private readonly appPrefix: string;
  private readonly logger = new Logger(CacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.appPrefix = this.configService.get<string>('APP_NAME') || 'app';
  }

  /**
   * Fetches data from cache if available, otherwise resolves it and caches the result.
   * Implements cache-first retrieval.
   * @param args Arguments for the key builder and resolver.
   * @param config Configuration object containing key builder, resolver, and optional tags.
   * @returns The resolved data.
   */
  async fetch<TArgs extends unknown[], TResult>(
    args: TArgs,
    config: {
      key: string;
      resolver: (...args: TArgs) => Promise<TResult>;
      tags?: string[];
      ttlSeconds?: number;
    },
  ): Promise<TResult> {
    const cacheKey = this.#makeKey(config.key);

    const cachedValue = await this.redisService.get<TResult>(cacheKey);
    if (cachedValue !== null) {
      this.logger.log(`Cache HIT for key: ${cacheKey}`);
      return cachedValue;
    }

    this.logger.log(`Cache MISS for key: ${cacheKey}. Fetching from resolver.`);
    const result = await config.resolver(...args);

    await this.redisService.set({
      key: cacheKey,
      value: result,
      ttlSeconds: config.ttlSeconds,
    });

    if (config.tags && config.tags.length > 0) {
      for (const tag of config.tags) {
        const tagSetKey = `${TAG_SET_PREFIX}${tag}`;
        await this.redisService.sAdd(tagSetKey, cacheKey);
      }
    }

    return result;
  }

  /**
   * Invalidates one or more cache keys.
   * @param keys A single key or an array of keys to invalidate.
   */
  async invalidate(keys: string | string[]): Promise<void> {
    const keysToDelete = Array.isArray(keys)
      ? keys.map((k) => this.#makeKey(k))
      : [this.#makeKey(keys)];

    if (keysToDelete.length === 0) {
      return;
    }

    await this.redisService.delete(keysToDelete);
    this.logger.log(`Invalidated key(s): ${keysToDelete.join(', ')}`);
  }

  /**
   * Invalidates all cache keys matching a given prefix.
   * WARNING: Uses SCAN, which can be slow on large Redis datasets.
   * @param prefix The prefix to match (e.g., "transactions:user:").
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    this.logger.log(`Attempting to invalidate keys with prefix: ${prefix}`);
    const keysToDelete: string[] = [];

    const scanPattern = this.#makeKey(
      prefix.endsWith('*') ? prefix : `${prefix}*`,
    );

    for await (const key of this.redisService.scan(scanPattern)) {
      if (!key.startsWith(TAG_SET_PREFIX)) {
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      await this.redisService.delete(keysToDelete);
      this.logger.log(
        `Invalidated ${keysToDelete.length} keys with prefix ${prefix}:`,
        keysToDelete,
      );
    } else {
      this.logger.log(`No keys found with prefix: ${prefix}`);
    }
  }

  /**
   * Invalidates all cache keys associated with given tag(s).
   * @param tags A single tag or array of tags to invalidate.
   */
  async invalidateByTag(tags: string | string[]): Promise<void> {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const allKeysToInvalidate = new Set<string>();
    const tagSetKeys: string[] = [];

    for (const tag of tagArray) {
      const tagSetKey = `${TAG_SET_PREFIX}${tag}`;
      tagSetKeys.push(tagSetKey);
      this.logger.log(
        `Attempting to invalidate keys for tag: ${tag} (set key: ${tagSetKey})`,
      );

      const keysForTag = await this.redisService.sMembers(tagSetKey);
      keysForTag.forEach((key) => allKeysToInvalidate.add(key));

      if (keysForTag.length > 0) {
        this.logger.log(
          `Found ${keysForTag.length} keys for tag ${tag}:`,
          keysForTag,
        );
      } else {
        this.logger.log(`No keys found for tag: ${tag}`);
      }
    }

    if (allKeysToInvalidate.size > 0) {
      const allKeysToDelete = [...allKeysToInvalidate, ...tagSetKeys];
      await this.redisService.delete(allKeysToDelete);

      this.logger.log(
        `Invalidated ${allKeysToInvalidate.size} keys and removed ${tagSetKeys.length} tag sets.`,
      );
    } else {
      this.logger.log(`No keys found for any of the provided tags.`);
    }
  }

  /**
   * Sets a value in Redis.
   * @param key
   * @param value
   * @param ttlSeconds
   */
  async set(key: string, value: unknown, ttlSeconds?: number) {
    return this.redisService.set({
      key: this.#makeKey(key),
      value,
      ttlSeconds,
    });
  }

  /**
   * Retrieves a value from cache by key.
   * @param key The key to retrieve.
   * @returns The value if found, otherwise null.
   */
  async get<T>(key: string) {
    return this.redisService.get<T>(this.#makeKey(key));
  }

  /**
   * Deletes one or more keys from cache.
   * @param key
   */
  async delete(key: string | string[]) {
    const keysToDel = Array.isArray(key)
      ? key.map((k) => this.#makeKey(k))
      : [this.#makeKey(key)];

    return this.redisService.delete(keysToDel);
  }

  #makeKey(key: string) {
    return `${this.appPrefix}:${key}`;
  }
}
