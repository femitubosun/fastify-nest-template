import {
  LoginUserDto,
  RegisterUserDto,
} from '@/identity/auth/__defs__/auth.dto';
import { UserRepository } from '@/identity/user/repositories';
import { HashService } from '@/infrastructure/crypto/services/hash.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
  ) {}

  async registerUser(input: RegisterUserDto) {
    const { email, name, password } = input;

    const existingUser = await this.userRepository.findIdByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return await this.userRepository.create({
      email,
      name,
      password: await this.hashService.hash(password),
    });
  }

  async authenticateUser(input: LoginUserDto) {
    const user = await this.userRepository.findFullUserByEmail(input.email);
    if (!user?.password)
      throw new BadRequestException('Invalid Authentication Method');

    const isValid = await this.hashService.verify(
      user.password,
      input.password,
    );
    if (!isValid) throw new BadRequestException('Invalid Password');

    return user;
  }
}
