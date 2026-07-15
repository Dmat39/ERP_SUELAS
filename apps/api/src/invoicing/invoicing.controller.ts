import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoicingService } from './invoicing.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invoices')
export class InvoicingController {
  constructor(private readonly invoicingService: InvoicingService) {}

  @Get()
  list() {
    return this.invoicingService.list();
  }

  @Get('by-order/:orderId')
  getByOrder(@Param('orderId') orderId: string) {
    return this.invoicingService.getByOrder(orderId);
  }

  // Descarga el PDF del comprobante (se genera al momento).
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.invoicingService.getPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  }

  @Roles('ADMIN', 'VENDEDOR')
  @Post()
  generate(@Body() dto: GenerateInvoiceDto) {
    return this.invoicingService.generate(dto.orderId, dto.type);
  }

  // Corrección del comprobante: SOLO el administrador puede hacerla.
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicingService.updateType(id, dto.type);
  }

  // Anular comprobante: SOLO el administrador.
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoicingService.remove(id);
  }
}
