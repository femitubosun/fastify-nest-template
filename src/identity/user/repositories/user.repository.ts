import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@/infrastructure/prisma/__defs__';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  #User = this.prismaService.user;

  /**
   * Finds the ID of a user by their email address.
   *
   * @param {string} email - The email address of the user.
   * @return {Promise<{ id: string } | null>} A promise that resolves to the ID of the user if found, or null if not found.
   */
  async findIdByEmail(email: string): Promise<{ id: string } | null> {
    return this.#User.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Creates a new user with the provided email, password, and optional name.
   *
   * @param {Object} data - The data object containing the email, password, and optional name.
   * @param {string} data.email - The email of the user.
   * @param {string} data.password - The password of the user.
   * @param {string} [data.name] - The optional name of the user.
   * @return {Promise<User>} A promise that resolves to the created user.
   */
  async create(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<User> {
    return this.#User.create({ data });
  }

  /**
   * Finds a full user by their email address.
   *
   * @param {string} email - The email address of the user.
   * @return {Promise<User | null>} A promise that resolves to the full user object if found, or null if not found.
   */
  async findFullUserByEmail(email: string): Promise<User | null> {
    return this.#User.findFirst({
      where: {
        email,
      },
    });
  }

  async findUserWithPasswordById(
    id: string,
  ): Promise<{ id: string; password?: string } | null> {
    return this.#User.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        password: true,
      },
    });
  }

  /**
   * Updates the password for a user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} newPassword - The new password for the user.
   * @return {Promise<void>} A promise that resolves when the password is updated.
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }
}
