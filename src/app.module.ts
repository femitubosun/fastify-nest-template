import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [InfrastructureModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
