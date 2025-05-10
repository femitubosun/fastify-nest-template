import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

import { IdentityModule } from './identity/identity.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { ConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    InfrastructureModule,
    ConfigModule,
    // RedisModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     url: configService.get<string>('CACHE_URL')!,
    //   }),
    //   inject: [ConfigService],
    // }),

    IdentityModule,
    ConfigModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
