import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SalesListener } from './sales.listener';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, SalesListener, PrismaService],
})
export class SalesModule {}
