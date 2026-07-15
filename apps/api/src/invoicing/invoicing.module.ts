import { Module } from '@nestjs/common';
import { InvoicingService } from './invoicing.service';
import { InvoicingController } from './invoicing.controller';
import { InvoicePdfService } from './invoice-pdf.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [InvoicingController],
  providers: [InvoicingService, InvoicePdfService, PrismaService],
})
export class InvoicingModule {}
