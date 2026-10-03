import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto.js';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'Application health status.',
  })
  health() {
    return {
      status: 'ok',
    };
  }
}
