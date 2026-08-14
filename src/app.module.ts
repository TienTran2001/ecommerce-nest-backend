import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PinoLoggerModule } from './config/logger/logger.module';
import { AppThrottlerModule } from './config/throttler/throttler.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CorrelationIdMiddleware } from './core/middlewares/correlation-id.middleware';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { allConfigs } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/database/typeorm-config.service';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { AddressModule } from './app/address/address.module';
import { CategoryModule } from './app/category/category.module';
import { ProductModule } from './app/product/product.module';
import { ProductImageModule } from './app/product-image/product-image.module';

const envFile =
  process.env.NODE_ENV === 'production'
    ? ['.env.prod', '.env']
    : ['.env.dev', '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      envFilePath: envFile,
      load: allConfigs,
    }),
    PinoLoggerModule,
    AppThrottlerModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    UserModule,
    AddressModule,
    CategoryModule,
    ProductModule,
    ProductImageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
