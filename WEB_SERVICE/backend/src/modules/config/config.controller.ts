import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

type UpdateConfigBody = Omit<UpdateConfigDto, 'key'>;

@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async findAll() {
    return this.configService.findAll();
  }

  @Get(':key')
  async findByKey(@Param('key') key: string) {
    const config = await this.configService.findByKey(key);
    if (!config) {
      return { key, value: null, exists: false };
    }
    return config;
  }

  @Post()
  async upsert(@Body() data: UpdateConfigDto) {
    return this.configService.upsert({
      key: data.key!,
      value: data.value,
      type: data.type,
      description: data.description,
    });
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body() data: UpdateConfigBody) {
    return this.configService.upsert({
      key,
      value: data.value,
      type: data.type,
      description: data.description,
    });
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('key') key: string) {
    await this.configService.deleteByKey(key);
  }
}
