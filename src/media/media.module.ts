import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { MediaRepository } from './media.repository.js';
import { DatabaseModule } from '../common/database/database.module.js';
import { Media, MediaSchema } from './entities/media.entity.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule,
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
  providers: [MediaService, MediaRepository],
})
export class MediaModule {}
