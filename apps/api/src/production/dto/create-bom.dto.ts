import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BomLineDto {
  @IsString()
  rawMaterialId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001, { message: 'La cantidad debe ser mayor a 0' })
  quantity!: number; // cantidad de MP por 1 unidad de producto
}

export class CreateBomDto {
  @IsString()
  variantId!: string;

  @IsString()
  @MinLength(2, { message: 'El nombre de la receta es obligatorio' })
  name!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'La receta necesita al menos una línea de materia prima' })
  @ValidateNested({ each: true })
  @Type(() => BomLineDto)
  lines!: BomLineDto[];
}
