import { IsEnum } from 'class-validator';
import { InvoiceType } from '@prisma/client';

export class UpdateInvoiceDto {
  @IsEnum(InvoiceType, { message: 'El tipo debe ser BOLETA o FACTURA' })
  type!: InvoiceType;
}
