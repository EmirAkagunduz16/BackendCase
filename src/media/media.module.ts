import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { MediaRepository } from './media.repository.js';
import { DatabaseModule } from '../common/database/database.module.js';
import { Media, MediaSchema } from './entities/media.entity.js';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
})
export class MediaModule {}
