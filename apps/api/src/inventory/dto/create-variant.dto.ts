import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  templateId!: string;

  @IsString()
  @MinLength(1, { message: 'El SKU es obligatorio' })
  sku!: string;

  // Valor de la talla (ej. "42"). Si aún no existe, se crea automáticamente.
  @IsString()
  @MinLength(1, { message: 'La talla es obligatoria' })
  talla!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceOverride?: number;
}
