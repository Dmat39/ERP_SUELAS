import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderOrigin } from '@prisma/client';

export class OrderItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsString()
  customerId!: string;

  @IsEnum(OrderOrigin, { message: 'origin debe ser INTERNO o WEB' })
  origin!: OrderOrigin;

  @IsArray()
  @ArrayNotEmpty({ message: 'El pedido necesita al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class ConfirmOrderDto {
  @IsString()
  warehouseId!: string;
}
