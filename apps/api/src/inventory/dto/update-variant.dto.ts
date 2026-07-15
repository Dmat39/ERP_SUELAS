import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El SKU es obligatorio' })
  sku?: string;

  // number para fijar precio propio; null para volver al precio base del producto.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceOverride?: number | null;
}
