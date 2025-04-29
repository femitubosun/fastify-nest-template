import { Module } from '@nestjs/common';
import { JwtService } from '@infra/crypto/services/jwt.service';
import { EncryptService } from '@infra/crypto/services/encrypt.service';
import { HashService } from '@infra/crypto/services/hash.service';

@Module({
  providers: [JwtService, EncryptService, HashService],
  exports: [JwtService, EncryptService, HashService],
})
export class CryptoModule {}
