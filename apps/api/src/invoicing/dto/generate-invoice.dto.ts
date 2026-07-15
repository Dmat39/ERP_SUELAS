import { IsEnum, IsString } from 'class-validator';
import { InvoiceType } from '@prisma/client';

export class GenerateInvoiceDto {
  @IsString()
  orderId!: string;

  @IsEnum(InvoiceType, { message: 'El tipo debe ser BOLETA o FACTURA' })
  type!: InvoiceType;
}
