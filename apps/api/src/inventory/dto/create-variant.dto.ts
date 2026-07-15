import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  templateId!: string;

  @IsString()
  @MinLength(1, { message: 'El SKU es obligatorio' })
  sku!: string;

  // IDs de AttributeValue (ej: la talla "40"). Al menos uno.
  @IsArray()
  @ArrayNotEmpty({ message: 'Selecciona al menos un valor de atributo (ej. talla)' })
  @IsString({ each: true })
  attributeValueIds!: string[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceOverride?: number;
}
