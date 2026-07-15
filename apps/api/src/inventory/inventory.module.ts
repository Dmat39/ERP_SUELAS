import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryListener } from './inventory.listener';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryListener, PrismaService],
})
export class InventoryModule {}
