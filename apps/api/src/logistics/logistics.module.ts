import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [LogisticsController],
  providers: [LogisticsService, PrismaService],
})
export class LogisticsModule {}
