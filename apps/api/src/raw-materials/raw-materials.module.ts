import { Module } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterialsController } from './raw-materials.controller';
import { RawMaterialsListener } from './raw-materials.listener';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [RawMaterialsController],
  providers: [RawMaterialsService, RawMaterialsListener, PrismaService],
})
export class RawMaterialsModule {}
