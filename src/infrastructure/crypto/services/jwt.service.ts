import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET') ?? '';
  }

  async sign(payload: Record<string, any>, expiresIn = '15m'): Promise<string> {
    return await new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.secret,
        { expiresIn: expiresIn as any },
        (err, token) => {
          if (err || !token)
            return reject(new Error(err?.message || 'Token signing failed'));
          resolve(token);
        },
      );
    });
  }

  async verify<T = any>(token: string): Promise<T> {
    return await new Promise<T>((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decoded) => {
        if (err)
          return reject(new Error(err?.message || 'Could not verify token'));
        resolve(decoded as T);
      });
    });
  }
}
