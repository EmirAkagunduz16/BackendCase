import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { MediaRepository } from './media.repository.js';
import { DatabaseModule } from '../common/database/database.module.js';
import { Media, MediaSchema } from './entities/media.entity.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MediaAccessGuard } from './guards/media-access.guard.js';
import { MediaOwnerGuard } from './guards/media-owner.guard.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: Number(configService.getOrThrow('MAX_FILE_SIZE')),
        },
      }),
    }),
    DatabaseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, MediaAccessGuard, MediaOwnerGuard],
})
export class MediaModule {}
