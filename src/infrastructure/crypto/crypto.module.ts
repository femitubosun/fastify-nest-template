import { Module } from '@nestjs/common';
import { JwtService } from './services/jwt.service';
import { EncryptService } from './services/encrypt.service';
import { HashService } from './services/hash.service';

@Module({
  providers: [JwtService, EncryptService, HashService],
  exports: [JwtService, EncryptService, HashService],
})
export class CryptoModule {}
