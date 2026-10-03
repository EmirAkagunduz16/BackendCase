import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../common/database/abstract.repository.js';
import { Media } from './entities/media.entity.js';

@Injectable()
export class MediaRepository extends AbstractRepository<Media> {
  protected readonly logger = new Logger(MediaRepository.name);

  constructor(@InjectModel(Media.name) mediaModel: Model<Media>) {
    super(mediaModel);
  }
}
