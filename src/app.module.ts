import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        return {
          type: 'mysql',
          host: config.get<string>('DB_CONNECTION')!,
          port: config.get<number>('DB_PORT')!,
          username: config.get<string>('DB_USERNAME')!,
          password: config.get<string>('DB_PASSWORD')!,
          database: config.get<string>('DB_DATABASE')!,
          synchronize: process.env.NODE_ENV !== 'prod',
          entities: [UserEntity],
        };
      },
    }),
    PassportModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
