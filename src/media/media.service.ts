import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, open, rm } from 'fs/promises';
import { join, resolve } from 'path';
import type { Types } from 'mongoose';
import { UpdateMediaDto } from './dto/update-media.dto.js';
import { MediaRepository } from './media.repository.js';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: Express.Multer.File, ownerId: Types.ObjectId) {
    const uploadDir = resolve(
      this.configService.getOrThrow<string>('UPLOAD_DIR'),
    );
    await mkdir(uploadDir, { recursive: true });
    const fileName = `${randomUUID()}.jpg`;
    const filePath = join(uploadDir, fileName);

    const fileHandle = await open(filePath, 'wx');
    try {
      await fileHandle.writeFile(file.buffer);
      await fileHandle.close();

      const media = await this.mediaRepository.create({
        ownerId,
        fileName,
        filePath,
        mimeType: 'image/jpeg',
        size: file.size,
      });

      return {
        _id: media._id,
        ownerId: media.ownerId,
        fileName: media.fileName,
        mimeType: media.mimeType,
        size: media.size,
        allowedUserIds: media.allowedUserIds,
        createdAt: media.createdAt,
      };
    } catch (error) {
      try {
        await fileHandle.close();
      } catch (closeError) {
        this.logger.error('Failed to close uploaded file.', closeError);
      }
      try {
        await rm(filePath, { force: true });
      } catch (cleanupError) {
        this.logger.error(
          'Failed to remove file after upload failed.',
          cleanupError,
        );
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all media`;
  }

  findOne(id: number) {
    return `This action returns a #${id} media`;
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return `This action updates a #${id} media`;
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
