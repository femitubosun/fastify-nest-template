import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { User } from '../../prisma/__defs__';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@nestjs/config');
jest.mock('jsonwebtoken');

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-secret'),
};

const mockUser: User = {
  id: 'user-id',
  email: 'user@example.com',
  password: '',
};

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
  });

  describe('sign', () => {
    it('should sign a payload and return a token', async () => {
      const payload = { sub: mockUser.id };
      const token = 'signed-token';
      (jwt.sign as jest.Mock).mockImplementation(
        (payload, secret, options, callback) => {
          callback(null, token);
        },
      );

      const result = await jwtService.sign(payload);
      expect(result).toBe(token);
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        'test-secret',
        { expiresIn: '15m' },
        expect.any(Function),
      );
    });
  });

  describe('verify', () => {
    it('should verify a token and return the decoded payload', async () => {
      const token = 'valid-token';
      const decoded = { sub: mockUser.id };
      (jwt.verify as jest.Mock).mockImplementation(
        (_token, _secret, callback) => {
          callback(null, decoded);
        },
      );

      const result = await jwtService.verify(token);
      expect(result).toEqual(decoded);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        'test-secret',
        expect.any(Function),
      );
    });

    it('should throw an error if token verification fails', async () => {
      const token = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(
        (_token, _secret, callback) => {
          callback(new Error('Invalid token'));
        },
      );

      await expect(jwtService.verify(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('generateAuthToken', () => {
    it('should generate an auth token with the correct payload', async () => {
      const sessionVersion = 1;
      const token = 'auth-token';
      (jwt.sign as jest.Mock).mockImplementation(
        (_payload, _secret, _options, callback) => {
          callback(null, token);
        },
      );

      const result = await jwtService.generateAuthToken(
        mockUser,
        sessionVersion,
      );
      expect(result).toBe(token);
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, sessionVersion },
        'test-secret',
        { expiresIn: '15m' },
        expect.any(Function),
      );
    });
  });
});
