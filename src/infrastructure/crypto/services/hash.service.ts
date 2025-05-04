import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class HashService {
  async hash(plaintext: string): Promise<string> {
    try {
      return await argon2.hash(plaintext);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to hash password');
    }
  }

  async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to verify password');
    }
  }

  sha256Hash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}
