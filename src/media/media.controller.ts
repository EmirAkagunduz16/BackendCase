import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  StreamableFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { MediaService } from './media.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { PublicUser } from '../users/entities/user.entity.js';
import { MediaAccessGuard } from './guards/media-access.guard.js';
import { CurrentMedia } from './current-media.decorator.js';
import type { Media } from './entities/media.entity.js';
import { MediaOwnerGuard } from './guards/media-owner.guard.js';
import { UpdateMediaPermissionDto } from './dto/update-permissions.dto.js';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /^image\/jpeg$/ })],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: PublicUser,
  ) {
    return this.mediaService.upload(file, user._id);
  }

  @Get('my')
  findMy(@CurrentUser() user: PublicUser) {
    return this.mediaService.findMy(user._id);
  }

  @Get(':id')
  @UseGuards(MediaAccessGuard)
  findOne(@CurrentMedia() media: Media) {
    return this.mediaService.toPublicMedia(media);
  }

  @Get(':id/download')
  @UseGuards(MediaAccessGuard)
  async download(@CurrentMedia() media: Media): Promise<StreamableFile> {
    const stream = await this.mediaService.download(media);
    return new StreamableFile(stream, {
      type: 'image/jpeg',
      disposition: `attachment; filename="${media.fileName}"`,
      length: media.size,
    });
  }

  @Get(':id/permissions')
  @UseGuards(MediaOwnerGuard)
  permissions(@CurrentMedia() media: Media) {
    return this.mediaService.getPermissions(media);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MediaOwnerGuard)
  updatePermissions(
    @CurrentMedia() media: Media,
    @CurrentUser() user: PublicUser,
    @Body() updateMediaPermissionDto: UpdateMediaPermissionDto,
  ) {
    return this.mediaService.updatePermissions(
      media,
      user._id,
      updateMediaPermissionDto,
    );
  }
}
