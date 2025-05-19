import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType, SetOptions } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  /**
   * Retrieves a value from Redis by key.
   * @param key The key to retrieve.
   * @returns The value if found, otherwise null.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null || value === undefined) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Sets a value in Redis.
   * @param opts Options for setting the value, including key, value, and optional TTL.
   */
  async set(opts: {
    key: string;
    value: unknown;
    ttlSeconds?: number;
  }): Promise<void> {
    try {
      const { key, value, ttlSeconds } = opts;
      const stringValue = JSON.stringify(value);

      const setOpts: SetOptions = {};
      if (ttlSeconds) {
        setOpts.EX = ttlSeconds;
      }

      if (Object.keys(setOpts).length > 0) {
        await this.client.set(key, stringValue, setOpts);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting key ${opts.key} in Redis:`, error);
    }
  }

  /**
   * Deletes one or more keys from Redis.
   * @param key The key or keys to delete.
   */
  async delete(key: string | string[]): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key(s) ${String(key)} from Redis:`, error);
    }
  }

  async *scan(pattern = '*') {
    const iterator = this.client.scanIterator({ MATCH: pattern });
    for await (const key of iterator) {
      yield key;
    }
  }

  /**
   * Adds one or more members to a set.
   * Used for tagging cache keys.
   * @param tag The key of the set (the tag).
   * @param key The cache key (string) or keys (array of strings) to add to the set.
   */
  async sAdd(tag: string, key: string | string[]): Promise<void> {
    try {
      const members = Array.isArray(key) ? key : [key];
      if (members.length > 0) {
        await this.client.sAdd(tag, members);
      }
    } catch (error) {
      console.error(`Error adding members to set ${tag}:`, error);
    }
  }

  /**
   * Gets all members of a set.
   * Used to retrieve all keys associated with a tag.
   * @param tag The key of the set (the tag).
   * @returns An array of members (cache keys).
   */
  async sMembers(tag: string): Promise<string[]> {
    try {
      return await this.client.sMembers(tag);
    } catch (error) {
      console.error(`Error getting members for set ${tag}:`, error);
      return [];
    }
  }

  /**
   * Removes members from a set.
   * Useful when a key associated with a tag is deleted.
   * @param tag The key of the set (the tag).
   * @param key The cache key (string) or keys (array of strings) to remove from the set.
   */
  async sRem(tag: string, key: string | string[]): Promise<void> {
    try {
      const members = Array.isArray(key) ? key : [key];
      if (members.length > 0) {
        await this.client.sRem(tag, members);
      }
    } catch (error) {
      console.error(`Error removing members from set ${tag}:`, error);
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
