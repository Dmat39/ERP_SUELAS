import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateRawMaterialDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre es obligatorio' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La unidad es obligatoria (kg, lt, unidad)' })
  unit?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minStock?: number;
}
