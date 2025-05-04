import { HashService } from 'src/infrastructure/crypto/services/hash.service';

export class PasswordService {
  constructor(private readonly hashService: HashService) {}

  async hashPassword(password: string): Promise<string> {
    return this.hashService.hash(password);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return this.hashService.verify(hashedPassword, password);
  }
}
