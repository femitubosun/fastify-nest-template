import { Injectable } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

  async getHello() {
    return this.prismaService.user.findMany();
  }
}
