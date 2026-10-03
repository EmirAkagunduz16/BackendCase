import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, open, rm, type FileHandle } from 'fs/promises';
import { join, resolve } from 'path';
import { Types } from 'mongoose';
import { MediaRepository } from './media.repository.js';
import type { Media, PublicMedia } from './entities/media.entity.js';
import { UsersService } from '../users/users.service.js';
import type { UpdateMediaPermissionDto } from './dto/update-permissions.dto.js';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
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

      return this.toPublicMedia(media);
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

  async findMy(ownerId: Types.ObjectId) {
    const media = await this.mediaRepository.find({ ownerId });
    return media.map((item) => this.toPublicMedia(item));
  }

  findOne(id: Types.ObjectId) {
    return this.mediaRepository.findOne({ _id: id });
  }

  getPermissions(media: Media) {
    return {
      mediaId: media._id,
      allowedUserIds: media.allowedUserIds,
    };
  }

  async updatePermissions(
    media: Media,
    ownerId: Types.ObjectId,
    updateMediaPermissionDto: UpdateMediaPermissionDto,
  ) {
    const userId = new Types.ObjectId(updateMediaPermissionDto.userId);
    if (userId.equals(ownerId)) {
      throw new BadRequestException('Cannot change permissions for the owner.');
    }

    if (updateMediaPermissionDto.action === 'add') {
      await this.usersService.getUser({ _id: userId });
    }

    const update =
      updateMediaPermissionDto.action === 'add'
        ? { $addToSet: { allowedUserIds: userId } }
        : { $pull: { allowedUserIds: userId } };
    const updatedMedia = await this.mediaRepository.findOneAndUpdate(
      { _id: media._id, ownerId },
      update,
    );
    return this.getPermissions(updatedMedia);
  }

  async download(media: Media) {
    let fileHandle: FileHandle;
    try {
      fileHandle = await open(media.filePath, 'r');
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new NotFoundException('Media file not found.');
      }
      throw error;
    }
    return fileHandle.createReadStream();
  }

  toPublicMedia(media: Media): PublicMedia {
    return {
      _id: media._id,
      ownerId: media.ownerId,
      fileName: media.fileName,
      mimeType: media.mimeType,
      size: media.size,
      allowedUserIds: media.allowedUserIds,
      createdAt: media.createdAt,
    };
  }
}
