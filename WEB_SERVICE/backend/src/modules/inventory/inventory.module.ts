import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, CloudinaryService],
  exports: [InventoryService],
})
export class InventoryModule {}
