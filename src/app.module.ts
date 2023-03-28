import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { validationSchema } from './config/validationSchema';
import emailConfig from './config/emailConfig';
import authConfig from './config/authConfig';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { ExceptionModule } from './exception/exception.module';
import { LoggingModule } from './logging/logging.module';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check/health-check.controller';
import { DogHealthIndicator } from './health-check/dog.health';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      load: [emailConfig, authConfig],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema,
    }),
    DatabaseModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    ExceptionModule,
    LoggingModule,
    TerminusModule,
    HttpModule,
  ],
  controllers: [HealthCheckController],
  providers: [DogHealthIndicator],
})
export class AppModule {}
