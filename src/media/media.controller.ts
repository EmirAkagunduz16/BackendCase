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
  Delete,
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MediaResponseDto } from './dto/media-response.dto.js';
import { MediaPermissionsResponseDto } from './dto/media-permissions-response.dto.js';

@ApiTags('Media')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing, invalid or expired access token.',
})
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiBadRequestResponse({
    description: 'Missing file or file content is not JPEG.',
  })
  @ApiPayloadTooLargeResponse({
    description: 'File exceeds the 5,242,880-byte size limit.',
  })
  @ApiCreatedResponse({
    type: MediaResponseDto,
    description: 'Uploaded media metadata.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'A single JPEG file. Maximum size: 5,242,880 bytes.',
        },
      },
    },
  })
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
  @ApiOkResponse({
    type: MediaResponseDto,
    isArray: true,
    description: 'Media uploaded by the authenticated user.',
  })
  findMy(@CurrentUser() user: PublicUser) {
    return this.mediaService.findMy(user._id);
  }

  @Get(':id')
  @ApiBadRequestResponse({ description: 'Invalid media ObjectId.' })
  @ApiForbiddenResponse({
    description: 'User is neither the media owner nor an allowed user.',
  })
  @ApiNotFoundResponse({ description: 'Media record not found.' })
  @ApiOkResponse({
    type: MediaResponseDto,
    description: 'Media metadata.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the media record.',
    example: '507f1f77bcf86cd799439011',
  })
  @UseGuards(MediaAccessGuard)
  findOne(@CurrentMedia() media: Media) {
    return this.mediaService.toPublicMedia(media);
  }

  @Get(':id/download')
  @ApiBadRequestResponse({ description: 'Invalid media ObjectId.' })
  @ApiForbiddenResponse({
    description: 'User is neither the media owner nor an allowed user.',
  })
  @ApiNotFoundResponse({
    description: 'Media record or physical file not found.',
  })
  @ApiOkResponse({
    description: 'JPEG file download.',
    content: {
      'image/jpeg': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the media record.',
    example: '507f1f77bcf86cd799439011',
  })
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
  @ApiBadRequestResponse({ description: 'Invalid media ObjectId.' })
  @ApiForbiddenResponse({
    description: 'Only the media owner can view permissions.',
  })
  @ApiNotFoundResponse({ description: 'Media record not found.' })
  @ApiOkResponse({
    type: MediaPermissionsResponseDto,
    description: 'Users allowed to access the media.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the media record.',
    example: '507f1f77bcf86cd799439011',
  })
  @UseGuards(MediaOwnerGuard)
  permissions(@CurrentMedia() media: Media) {
    return this.mediaService.getPermissions(media);
  }

  @Post(':id/permissions')
  @ApiBadRequestResponse({
    description:
      "Invalid media ObjectId, invalid request body or attempt to change the owner's permissions.",
  })
  @ApiForbiddenResponse({
    description: 'Only the media owner can update permissions.',
  })
  @ApiNotFoundResponse({
    description:
      'Media record or user receiving an added permission not found.',
  })
  @ApiOkResponse({
    type: MediaPermissionsResponseDto,
    description: 'Updated media permissions.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the media record.',
    example: '507f1f77bcf86cd799439011',
  })
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

  @Delete(':id')
  @ApiBadRequestResponse({ description: 'Invalid media ObjectId.' })
  @ApiForbiddenResponse({
    description: 'Only the media owner can delete the media.',
  })
  @ApiNotFoundResponse({ description: 'Media record not found.' })
  @ApiNoContentResponse({ description: 'Media deleted successfully.' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the media record.',
    example: '507f1f77bcf86cd799439011',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(MediaOwnerGuard)
  mediaDelete(@CurrentMedia() media: Media, @CurrentUser() user: PublicUser) {
    return this.mediaService.deleteMedia(media, user._id);
  }
}
